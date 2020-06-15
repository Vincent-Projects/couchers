import json
import logging
import traceback
from concurrent import futures
from datetime import date

import grpc
from auth import Auth
from crypto import hash_password
from db import get_user_by_field, session_scope
from interceptors import LoggingInterceptor, intercept_server
from models import Base, User
from pb import api_pb2, api_pb2_grpc, auth_pb2_grpc
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from utils import Timestamp_from_datetime

logging.basicConfig(format="%(asctime)s.%(msecs)03d: %(process)d: %(message)s", datefmt="%F %T", level=logging.DEBUG)
logging.info(f"Starting")

engine = create_engine("sqlite:///db.sqlite", echo=False)

Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)

def add_dummy_data(file_name):
    with session_scope(Session) as session:
        with open(file_name, "r") as file:
            users = json.loads(file.read())

        for user in users:
            new_user = User(
                username=user["username"],
                email=user["email"],
                hashed_password=hash_password(user["password"]) if user["password"] else None,
                name=user["name"],
                city=user["city"],
                verification=user["verification"],
                community_standing=user["community_standing"],
                birthdate=date(
                    year=user["birthdate"]["year"],
                    month=user["birthdate"]["month"],
                    day=user["birthdate"]["day"]
                ),
                gender=user["gender"],
                languages="|".join(user["languages"]),
                occupation=user["occupation"],
                about_me=user["about_me"],
                about_place=user["about_place"],
                countries_visited="|".join(user["countries_visited"]),
                countries_lived="|".join(user["countries_lived"]),
            )
            session.add(new_user)

logging.info(f"Adding dummy data")

try:
    add_dummy_data("src/dummy_data.json")
except IntegrityError as e:
    print("Failed to insert dummy data, is it already inserted?")

with session_scope(Session) as session:
    for user in session.query(User).all():
        print(user)

class APIServicer(api_pb2_grpc.APIServicer):
    def Ping(self, request, context):
        with session_scope(Session) as session:
            # auth ought to make sure the user exists
            user = session.query(User).filter(User.id == context.user_id).one()
            return api_pb2.PingRes(
                user_id=user.id,
                username=user.username,
                name=user.name
            )

    def GetUser(self, request, context):
        with session_scope(Session) as session:
            user = get_user_by_field(session, request.user)
            if not user:
                context.abort(grpc.StatusCode.NOT_FOUND, "No such user.")
            return api_pb2.User(
                username=user.username,
                name=user.name,
                city=user.city,
                verification=user.verification,
                community_standing=user.community_standing,
                num_references=0,
                gender=user.gender,
                age=user.age,
                joined=Timestamp_from_datetime(user.display_joined),
                last_active=Timestamp_from_datetime(user.display_last_active),
                occupation=user.occupation,
                about_me=user.about_me,
                about_place=user.about_place,
                languages=user.languages.split("|"),
                countries_visited=user.countries_visited.split("|"),
                countries_lived=user.countries_lived.split("|")
            )

auth = Auth(Session)
auth_server = grpc.server(futures.ThreadPoolExecutor(2))
auth_server.add_insecure_port("[::]:1752")
auth_pb2_grpc.add_AuthServicer_to_server(auth, auth_server)
auth_server.start()

server = grpc.server(futures.ThreadPoolExecutor(2))
server = intercept_server(server, LoggingInterceptor())
server = intercept_server(server, auth.get_auth_interceptor())
server.add_insecure_port("[::]:1751")
servicer = APIServicer()
api_pb2_grpc.add_APIServicer_to_server(servicer, server)
server.start()

logging.info(f"Serving on 1751 and 1752 (auth)")

server.wait_for_termination()
auth_server.wait_for_termination()
