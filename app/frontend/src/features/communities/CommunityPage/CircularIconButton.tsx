import {
  IconButton,
  IconButtonProps,
  makeStyles,
  Typography,
} from "@material-ui/core";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  body: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("md")]: {
      flexDirection: "row",
    },
  },
  link: {
    textDecoration: "none",
  },
  button: {
    marginBottom: theme.spacing(0.5),
  },
  label: {
    textAlign: "center",
    [theme.breakpoints.up("md")]: {
      textAlign: "left",
    },
  },
}));

interface CircularIconButtonProps extends IconButtonProps {
  children?: ReactNode;
  label: string;
  id: string;
  linkTo?: string;
  disabled?: boolean;
}

export default function CircularIconButton({
  children,
  id,
  label,
  linkTo,
  disabled = false,
  ...otherProps
}: CircularIconButtonProps) {
  const classes = useStyles();

  const body = (
    <div className={classes.body}>
      <IconButton
        {...otherProps}
        aria-labelledby={id}
        className={classes.button}
        children={children}
        disabled={disabled}
      />
      <Typography id={id} variant="caption" className={classes.label}>
        {label}
      </Typography>
    </div>
  );

  return linkTo ? (
    <Link to={linkTo} className={classes.link}>
      {body}
    </Link>
  ) : (
    body
  );
}
