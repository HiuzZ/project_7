import React from "react";
import { Link, Redirect } from "react-router-dom";
import {
  List, Divider, Typography, Grid, Avatar, Card, CardHeader,
  CardMedia, CardContent, CardActions, IconButton
} from "@material-ui/core";
import { ThumbUpOutlined, ThumbUp, ThumbDownOutlined, ThumbDown } from "@material-ui/icons";
import "./userPhotos.css";
import axios from "axios";
import CommentDialog from "../commentDialog/commentDialog";

export default class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: null, // photos list where each photo contains comments list
      user: null, // Author who posts the photo
      likedPhotos: JSON.parse(localStorage.getItem('likedPhotos')) || {}, // Load from local storage or initialize
      dislikedPhotos: JSON.parse(localStorage.getItem('dislikedPhotos')) || {}, // Load from local storage or initialize
    };
  }

  axios_fetch_photos_and_user() {
    axios.get(`/user/${this.props.match.params.userId}`)
      .then((response) => {
        this.setState({ user: response.data });
        this.props.onUserNameChange(
          response.data.first_name + " " + response.data.last_name
        );
        this.props.onLoginUserChange({
          first_name: response.data.logged_user_first_name,
        });
      })
      .catch((error) => console.log("/user/ Error: ", error));

    axios.get(`/photosOfUser/${this.props.match.params.userId}`)
      .then((response) => this.setState({ photos: response.data }))
      .catch((error) => console.log("/photosOfUser/ Error: ", error));
  }

  handleCommentSubmit = () => {
    this.axios_fetch_photos_and_user();
  };

  componentDidMount() {
    this.axios_fetch_photos_and_user();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.photoIsUploaded !== this.props.photoIsUploaded &&
      this.props.photoIsUploaded
    ) {
      this.axios_fetch_photos_and_user();
    }
  }

  static convertDate(isoDate) {
    const date = new Date(isoDate);
    const options = {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  handleLikeClick = (photoId) => {
    this.setState((prevState) => {
      const newLikedPhotos = {
        ...prevState.likedPhotos,
        [photoId]: !prevState.likedPhotos[photoId],
      };
      const newDislikedPhotos = {
        ...prevState.dislikedPhotos,
        [photoId]: false, // Ensure dislike is removed when liked
      };
      localStorage.setItem('likedPhotos', JSON.stringify(newLikedPhotos));
      localStorage.setItem('dislikedPhotos', JSON.stringify(newDislikedPhotos));
      return {
        likedPhotos: newLikedPhotos,
        dislikedPhotos: newDislikedPhotos
      };
    });
  };

  handleDislikeClick = (photoId) => {
    this.setState((prevState) => {
      const newDislikedPhotos = {
        ...prevState.dislikedPhotos,
        [photoId]: !prevState.dislikedPhotos[photoId],
      };
      const newLikedPhotos = {
        ...prevState.likedPhotos,
        [photoId]: false, // Ensure like is removed when disliked
      };
      localStorage.setItem('dislikedPhotos', JSON.stringify(newDislikedPhotos));
      localStorage.setItem('likedPhotos', JSON.stringify(newLikedPhotos));
      return {
        dislikedPhotos: newDislikedPhotos,
        likedPhotos: newLikedPhotos
      };
    });
  };

  render() {
    if (this.props.loginUser || !this.state.user || !this.state.photos) {
      return (
        this.state.photos && this.state.user && (
          <Grid container justifyContent="flex-start" spacing={3}>
            {this.state.photos.map((photo) => (
              <Grid item xs={6} key={photo._id}>
                <Card style={{ border: "3px solid black", borderRadius: '10px' }}>
                  <CardHeader
                    avatar={
                      <Avatar style={{ backgroundColor: "#ECB176", border: "1px solid black" }}>
                        {this.state.user.first_name[0]}
                      </Avatar>
                    }
                    title={
                      <Link to={`/users/${this.state.user._id}`}>
                        <Typography>{`${this.state.user.first_name} ${this.state.user.last_name}`}</Typography>
                      </Link>
                    }
                    subheader={photo.date_time}
                  />
                  <CardMedia
                    component="img"
                    image={`./images/${photo.file_name}`}
                    alt="Author Post"
                  />
                  <CardActions>
                    <IconButton
                      aria-label="like"
                      onClick={() => this.handleLikeClick(photo._id)}
                    >
                      {this.state.likedPhotos[photo._id] ? (
                        <ThumbUp style={{ color: "153448" }} />
                      ) : (
                        <ThumbUpOutlined />
                      )}
                    </IconButton>
                    <IconButton
                      aria-label="dislike"
                      onClick={() => this.handleDislikeClick(photo._id)}
                    >
                      {this.state.dislikedPhotos[photo._id] ? (
                        <ThumbDown style={{ color: "803D3B" }} />
                      ) : (
                        <ThumbDownOutlined />
                      )}
                    </IconButton>
                  </CardActions>
                  <CardContent>
                    {photo.comments && (
                      <Typography variant="subtitle1">
                        Comments:
                        <Divider />
                      </Typography>
                    )}
                    {photo.comments.map((c) => (
                      <List key={c._id}>
                        <Typography variant="subtitle2">
                          <Link to={`/users/${c.user._id}`}>
                            {`${c.user.first_name} ${c.user.last_name}`}
                          </Link>
                        </Typography>
                        <Typography variant="caption" color="textSecondary" gutterBottom>
                          {UserPhotos.convertDate(c.date_time)}
                        </Typography>
                        <Typography variant="body1">
                          {`"${c.comment}"`}
                        </Typography>
                      </List>
                    ))}
                    <CommentDialog
                      onCommentSubmit={this.handleCommentSubmit}
                      photo_id={photo._id}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      );
    } else {
      return <Redirect to={`/login-register`} />;
    }
  }
}
