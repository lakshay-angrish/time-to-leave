import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import axios from "axios";

class MapForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      source: "12.927880, 77.627600",
      destination: "13.035542, 77.597100",
      time: "21:09",
      email: "abc@default.com",
      requests: [],
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    //update form state with input change
    this.setState({
      [name]: value,
    });
  }

  handleSubmit(event) {
    //call express server to schedule the email
    axios
      .post(process.env.API_ENDPOINT, this.state)
      .then((res) => {
        console.log(res.data);
        this.setState({
          requests: this.state.requests.concat([
            new Date().toLocaleTimeString() +
              " - Requested Map API for: " +
              this.state.email,
          ]),
        });
      })
      .catch((err) => {
        console.error(err.message || err.error);
        alert(err.message || err.error);
      });
    event.preventDefault();
  }

  render() {
    const requests = this.state.requests.map((req, i) => {
      return <li key={i}>{req}</li>;
    });

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Source
            <input
              required
              name="source"
              type="text"
              value={this.state.source}
              onChange={this.handleInputChange}
            />
          </label>
          <br />
          <label>
            Destination
            <input
              required
              name="destination"
              type="text"
              value={this.state.destination}
              onChange={this.handleInputChange}
            />
          </label>
          <br />
          <label>
            Time
            <input
              required
              name="time"
              type="time"
              value={this.state.time}
              onChange={this.handleInputChange}
            />
          </label>
          <br />
          <label>
            Email
            <input
              required
              name="email"
              type="email"
              value={this.state.email}
              onChange={this.handleInputChange}
            />
          </label>
          <br />
          <input type="submit" value="Remind Me" />
        </form>
        <div>
          <ul>{requests}</ul>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<MapForm />, document.getElementById("root"));
