import React from "react";
import { Link, Redirect } from "react-router-dom";
import { Button, Grid, Typography } from "@material-ui/core";
import "./userDetail.css";
import axios from "axios";

export default class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  axios_fetchData(url) {
    axios
      .get(url)
      .then(response => {
        this.props.onUserNameChange(response.data.first_name + " " + response.data.last_name);
        this.props.onLoginUserChange({
          first_name: response.data.logged_user_first_name,
        });
        this.setState({ user: response.data });
        console.log("** UserDetail: fetched user detail **");
      })
      .catch(error => {
        console.log("** Error in UserDetail **\n", error.message);
      });
  }

  componentDidMount() {
    this.axios_fetchData(`/user/${this.props.match.params.userId}`);
  }

  componentDidUpdate(prevProps) {
    const prevUserID = prevProps.match.params.userId;
    const currUserID = this.props.match.params.userId;
    if (prevUserID !== currUserID && currUserID) {
      this.axios_fetchData(`/user/${currUserID}`);
    }
  }

  render() {
    if (this.props.loginUser || !this.state.user) {
      return this.state.user && (
        <Grid container justifyContent="center" alignItems="center" spacing={2} style={{ backgroundColor: "#FFF2D7", padding: "20px", border: "3px solid black", borderRadius: "10px" }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {`${this.state.user.first_name} ${this.state.user.last_name}`}
            </Typography>
            <Typography color="textSecondary">Description:</Typography>
            <Typography variant="h6" gutterBottom>
              {`${this.state.user.description}`}
            </Typography>
            <Typography color="textSecondary">Location:</Typography>
            <Typography variant="h6" gutterBottom>
              {`${this.state.user.location}`}
            </Typography>
            <Typography color="textSecondary">Occupation:</Typography>
            <Typography variant="h6" gutterBottom>
              {`${this.state.user.occupation}`}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Button
              size="large"
              to={this.state.user && `/photos/${this.state.user._id}`}
              component={Link}
              variant="contained"
              style={{ backgroundColor: "#ECB176" }}
            >
              See Photos
            </Button>
          </Grid>
        </Grid>
      );
    } else {
      return <Redirect to={`/login-register`} />;
    }
  }
}
