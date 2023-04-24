import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";

const App = () => {
  const [talks, setTalks] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendeeName, setAttendeeName] = useState("");
  const [talkData, setTalkData] = useState({
    title: "",
    description: "",
    meetingLink: "",
  });
  const [attendeeData, setAttendeeData] = useState({
    name: "",
    gender: "",
    email: "",
    address: "",
  });
  const [messages, setMessages] = useState([]);
  const [talkInput, setTalkInput] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showData, setShowData] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    FetchAttendees();
  }, []);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.on("chat message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (inputValue) {
      socketRef.current.emit("chat message", inputValue);
      setInputValue("");
    }
  };

  useEffect(() => {
    FetchTalks();
  }, []);

  async function FetchTalks() {
    const response = await axios.get(
      "http://167.172.157.222:3033/talks/active"
    );
    setTalks(response.data);
  }

  const FetchAttendees = () => {
    axios.get("http://167.172.157.222:3033/attendees").then((response) => {
      setAttendees(response.data);
    });
  };

  const deleteTalk = (talkId) => {
    axios
      .delete(`http://167.172.157.222:3033/talks/:${talkId}`)
      .then((response) => {
        console.log("delete", response);
      });
    setTalks((prevTalks) => prevTalks.filter((talk) => talk._id !== talkId));
  };

  const handleTalkChange = (e) => {
    const { name, value } = e.target;
    setTalkData((prevTalkData) => ({ ...prevTalkData, [name]: value }));
  };

  const handleAttendeeChange = (e) => {
    const { name, value } = e.target;
    setAttendeeData((prevAttendeeData) => ({
      ...prevAttendeeData,
      [name]: value,
    }));
  };

  const handleAddTalk = (e) => {
    e.preventDefault();
    axios
      .post("http://167.172.157.222:3033/talks", talkData)
      .then((response) => {
        // console.log(response);
      })
      .finally(setTalkData({ title: "", description: "", meetingLink: "" }));
  };

  const handleAddAttendee = (e) => {
    e.preventDefault();
    axios
      .post("http://167.172.157.222:3033/attendees", attendeeData)
      .then((response) => {
        // console.log(response);
      })
      .finally(
        setAttendeeData({ name: "", gender: "", email: "", address: "" })
      );
  };

  const handleFetchTalks = async () => {
    FetchTalks();
    setShowData(true);
  };

  const handleFetchAttendees = async () => {
    FetchTalks();
    FetchAttendees();
  };

  const handleAddAttendeeToTalk = async () => {
    if (attendeeName.length <= 0) {
      alert("Please Select an Attendee");
    } else {
      const currTalk = talks.filter(
        (talk) => talk.title.toLowerCase() === talkInput.toLowerCase()
      );
      const currAttendee = attendees.filter(
        (attendee) => attendee.name === attendeeName
      );

      const talkId = currTalk[0]._id;
      const attendeeId = currAttendee[0]._id;
      console.log("talk", talkId);
      console.log("attendee", attendeeId);

      const addTalkToAttendeeData = {
        talkId: talkId,
        attendeeId: attendeeId,
      };

      axios
        .post(
          `http://167.172.157.222:3033/talks/attendee`,
          addTalkToAttendeeData
        )
        .then((response) => {
          console.log(response);
        })
        .finally(() => {
          setTalkInput("");
          setAttendeeName("");
        });
    }
  };

    const handleClick = () => {
        window.location.href = 'http://167.172.157.222:3033/chat';
    };

  return (
    <div>
      <h1>Conference Talks</h1>

      <h2>Add Talk</h2>
      <form onSubmit={handleAddTalk}>
        <div>
          <label htmlFor="title">
            Title:
            <input
              type="text"
              name="title"
              value={talkData.title}
              onChange={handleTalkChange}
            />
          </label>
        </div>
        <div>
          <label htmlFor="description">
            Description:
            <input
              type="text"
              name="description"
              value={talkData.description}
              onChange={handleTalkChange}
            />
          </label>
        </div>
        <div>
          <label htmlFor="meetingLink">
            Meeting Link:
            <input
              type="text"
              name="meetingLink"
              value={talkData.meetingLink}
              onChange={handleTalkChange}
            />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>

      <h2>Add Attendee</h2>
      <form onSubmit={handleAddAttendee}>
        <div>
          <label htmlFor="name">
            Name:
            <input
              type="text"
              name="name"
              value={attendeeData.name}
              onChange={handleAttendeeChange}
            />
          </label>
        </div>
        <div>
          <label htmlFor="gender">
            Gender:
            <input
              type="text"
              name="gender"
              value={attendeeData.gender}
              onChange={handleAttendeeChange}
            />
          </label>
        </div>
        <div>
          <label htmlFor="email">
            Email:
            <input
              type="email"
              name="email"
              value={attendeeData.email}
              onChange={handleAttendeeChange}
            />
          </label>
        </div>
        <div>
          <label htmlFor="address">
            Address:
            <input
              type="text"
              name="address"
              value={attendeeData.address}
              onChange={handleAttendeeChange}
            />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>

      <h2>Talks</h2>
      <button onClick={handleFetchTalks}>Fetch Talks</button>
      <ul>
        {showData &&
          talks &&
          talks.map((talk) => {
            return (
              <li key={talk._id}>
                <h3>{talk.title}</h3>
                <p>MeetingLink: {talk.meetingLink}</p>
                <div>
                  <button onClick={() => deleteTalk(talk._id)}>
                    Delete Talk
                  </button>
                </div>
              </li>
            );
          })}
      </ul>

      <div>
        <label>
          Add Attendee to a Talk:
          <br />
          <input
            type="text"
            value={talkInput}
            onChange={(e) => setTalkInput(e.target.value)}
            placeholder="Enter the name of the talk"
          />
          <br />
          <br />
          <select
            onClick={handleFetchAttendees}
            value={attendeeName}
            onChange={(e) => setAttendeeName(e.target.value)}
          >
            <option value="" disabled hidden>
              -- Select Attendee --
            </option>
            {attendees.map((attendee) => {
              return (
                <option key={attendee._id} value={attendee.name}>
                  {attendee.name}
                </option>
              );
            })}
          </select>
          <button onClick={handleAddAttendeeToTalk}>Add</button>
        </label>
      </div>

      <div>
        <br/>
          <button onClick={handleClick}>Got To Chat</button>
      </div>
    </div>
  );
};

export default App;
