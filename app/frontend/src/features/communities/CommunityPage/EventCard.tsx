import {
  Card,
  CardActionArea,
  CardContent,
  makeStyles,
  Typography,
} from "@material-ui/core";
import React from "react";
import LinesEllipsis from "react-lines-ellipsis";
import { Link } from "react-router-dom";

import { CalendarIcon, ClockIcon } from "../../../components/Icons";
import { routeToEvent } from "../../../routes";
import { timestamp2Date } from "../../../utils/date";

const useStyles = makeStyles((theme) => ({
  link: { textDecoration: "none", color: "inherit" },
  title: {
    ...theme.typography.h3,
    height: `calc(2 * calc(${theme.typography.h3.lineHeight} * ${theme.typography.h3.fontSize}))`,
    marginBottom: 0,
    marginTop: 0,
  },
  subtitle: { marginBottom: theme.spacing(0.5) },
  icon: {
    display: "block",
    fontSize: "1rem",
    marginInlineEnd: theme.spacing(0.5),
  },
  detailsList: {
    "ul&": {
      listStyle: "none",
      margin: 0,
      padding: 0,
    },
    "& > li": {
      alignItems: "center",
      display: "flex",
    },
  },
}));

export default function EventCard({
  event,
  className,
}: {
  event: {
    eventId?: number;
    slug?: string;
    title: string;
    creatorName: string;
    location: string;
    startTime: { seconds: number; nanos: number };
  };
  className?: string;
}) {
  const classes = useStyles();
  const date = timestamp2Date(event.startTime);
  return (
    <Card className={className}>
      <Link
        to={routeToEvent(event.eventId ?? 0, event.slug ?? "")}
        className={classes.link}
      >
        <CardActionArea>
          <CardContent>
            <LinesEllipsis
              maxLine={2}
              text={event.title}
              component="h3"
              className={classes.title}
            />
            <Typography
              variant="caption"
              component="p"
              className={classes.subtitle}
              noWrap
            >
              By {event.creatorName}
            </Typography>
            <ul className={classes.detailsList}>
              {/*Leaving this here but out for now. Seem
              seems like important info but the card is too small,
              Probably that's why it was left out of the design.
              <li>
                <LocationIcon className={classes.icon} />
                <Typography variant="body2" noWrap>
                  {event.location}
                </Typography>
              </li>*/}
              <li>
                <CalendarIcon className={classes.icon} />
                <Typography variant="body2" noWrap>
                  {date.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              </li>
              <li>
                <ClockIcon className={classes.icon} />
                <Typography variant="body2" noWrap>
                  {date.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Typography>
              </li>
            </ul>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
}
