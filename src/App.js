// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";

// const ENDPOINT = "http://localhost:3001";

// const App = () => {
//   const [talks, setTalks] = useState([]);
//   const [talkTitle, setTalkTitle] = useState("");
//   const [talkSpeaker, setTalkSpeaker] = useState("");
//   const [attendees, setAttendees] = useState([]);
//   const [attendeeName, setAttendeeName] = useState("");
//   const [chatMessages, setChatMessages] = useState([]);
//   const [chatMessage, setChatMessage] = useState("");

//   const socket = io(ENDPOINT);

//   useEffect(() => {
//     socket.on("chat message", (msg) => {
//       setChatMessages((prevMessages) => [...prevMessages, msg]);
//     });
//   }, [socket]);

//   useEffect(() => {
//     fetchTalks();
//   }, []);

//   const fetchTalks = async () => {
//     const response = await fetch("http://localhost:3000/talks");
//     const data = await response.json();
//     setTalks(data);
//   };

//   const addTalk = async () => {
//     const response = await fetch("http://localhost:3000//talks", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ title: talkTitle, speaker: talkSpeaker }),
//     });
//     const newTalk = await response.json();
//     setTalks((prevTalks) => [...prevTalks, newTalk]);
//     setTalkTitle("");
//     setTalkSpeaker("");
//   };

//   const addAttendee = async () => {
//     const response = await fetch("http://localhost:3000//attendees", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name: attendeeName }),
//     });
//     const newAttendee = await response.json();
//     setAttendees((prevAttendees) => [...prevAttendees, newAttendee]);
//     setAttendeeName("");
//   };

//   const addAttendeeToTalk = async (talkId, attendeeId) => {
//     await fetch(`http://localhost:3000//talks/${talkId}/attendees/${attendeeId}`, {
//       method: "POST",
//     });
//     setTalks((prevTalks) =>
//       prevTalks.map((talk) =>
//         talk.id === talkId
//           ? { ...talk, attendees: [...talk.attendees, attendeeName] }
//           : talk
//       )
//     );
//   };

//   const deleteTalk = async (talkId) => {
//     await fetch(`/talks/${talkId}`, {
//       method: "DELETE",
//     });
//     setTalks((prevTalks) => prevTalks.filter((talk) => talk.id !== talkId));
//   };

//   const handleChatMessage = (e) => {
//     e.preventDefault();
//     if (chatMessage !== "") {
//       socket.emit("chat message", { name: attendeeName, message: chatMessage });
//       setChatMessage("");
//     }
//   };

//   return (
//     <div>
//       <h1>Conference Talks</h1>

//       <h2>Add Talk</h2>
//       <form onSubmit={(e) => e.preventDefault()}>
//         <label        >
//           Attendee:
//           <select
//             value={attendeeName}
//             onChange={(e) => setAttendeeName(e.target.value)}
//           >
//             <option value="">-- Select Attendee --</option>
//             {attendees.map((attendee) => (
//               <option key={attendee.id} value={attendee.name}>
//                 {attendee.name}
//               </option>
//             ))}
//           </select>
//         </label>
//         <button onClick={addTalk}>Add Talk</button>
//       </form>

//       <h2>Talks</h2>
//       <button onClick={fetchTalks}>Fetch Talks</button>
//       <ul>
//         {talks.map((talk) => (
//           <li key={talk.id}>
//             <h3>{talk.title}</h3>
//             <p>Speaker: {talk.speaker}</p>
//             <ul>
//               {talk.attendees.map((attendee) => (
//                 <li key={attendee}>{attendee}</li>
//               ))}
//             </ul>
//             <label>
//               Add Attendee:
//               <select
//                 value={attendeeName}
//                 onChange={(e) => setAttendeeName(e.target.value)}
//               >
//                 <option value="">-- Select Attendee --</option>
//                 {attendees.map((attendee) => (
//                   <option key={attendee.id} value={attendee.name}>
//                     {attendee.name}
//                   </option>
//                 ))}
//               </select>
//               <button onClick={() => addAttendeeToTalk(talk.id, attendeeName)}>
//                 Add
//               </button>
//             </label>
//             <button onClick={() => deleteTalk(talk.id)}>Delete Talk</button>
//           </li>
//         ))}
//       </ul>

//       <h2>Chat</h2>
//       <div>
//         <form onSubmit={handleChatMessage}>
//           <label>
//             Name:
//             <input
//               type="text"
//               value={attendeeName}
//               onChange={(e) => setAttendeeName(e.target.value)}
//             />
//           </label>
//           <label>
//             Message:
//             <input
//               type="text"
//               value={chatMessage}
//               onChange={(e) => setChatMessage(e.target.value)}
//             />
//           </label>
//           <button type="submit">Send</button>
//         </form>
//       </div>
//       <ul>
//         {chatMessages.map((msg, index) => (
//           <li key={index}>
//             <strong>{msg.name}: </strong>
//             {msg.message}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default App;


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
        <ul id="messages">
          {messages.map((message, idx) => (
            <li key={idx}>{message}</li>
          ))}
        </ul>
        <form id="form" onSubmit={handleChatSubmit}>
          <h2>Chat</h2>
          <input
            id="input"
            autoComplete="off"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button>Send</button>
        </form>
      </div>
    </div>
  );
};

export default App;
