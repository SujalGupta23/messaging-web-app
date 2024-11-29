import React, { useEffect, useState } from "react";
import axios from "axios";

const AgentPortal = () => {
  const [messages, setMessages] = useState([]);
  const [groupedMessages, setGroupedMessages] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filteredMessages, setFilteredMessages] = useState([]); // Filtered messages based on search

  // Fetch messages on load
  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    // Whenever the search query changes, filter the messages
    if (searchQuery.trim()) {
      filterMessages(searchQuery); // Call the search API when a query is present
    } else {
      // Reset when the search query is cleared
      setFilteredMessages([]);
    }
  }, [searchQuery]);

  const fetchMessages = () => {
    setError(null);
    setLoading(true);
    axios
      .get("http://localhost:3000/messages")
      .then((response) => {
        const grouped = groupMessagesByUser(response.data);
        setMessages(response.data);
        setGroupedMessages(grouped);
        if (Object.keys(grouped).length > 0) {
          setSelectedUserId(Object.keys(grouped)[0]); // Default to the first user
        }
      })
      .catch(() => setError("Failed to fetch messages."))
      .finally(() => setLoading(false));
  };

  const groupMessagesByUser = (messages) => {
    return messages.reduce((acc, message) => {
      if (!acc[message.user_id]) {
        acc[message.user_id] = [];
      }
      acc[message.user_id].push(message);
      return acc;
    }, {});
  };

  // Function to filter messages via the backend API
  const filterMessages = (query) => {
    axios
      .post("http://localhost:3000/messages/search", { query }) // Send query in request body
      .then((response) => {
        setFilteredMessages(response.data); // Update the filtered messages state
      })
      .catch((error) => console.error("Search failed:", error));
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    const newMessage = {
      user_id: selectedUserId,
      message_body: replyMessage,
      admin_id: 1, // Assuming the admin ID is 1
    };

    // Send the reply to the backend
    axios
      .post("http://localhost:3000/messages/reply", newMessage)
      .then(() => {
        setReplyMessage(""); // Clear the input
        fetchMessages(); // Refresh messages
      })
      .catch((error) => console.error("Failed to send reply:", error));
  };

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
  };

  const handleSearchResultClick = (userId) => {
    // Select the user ID and clear the search query
    setSelectedUserId(userId);
    setSearchQuery("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-300 overflow-y-auto">
        {/* Search Input */}
        <div className="p-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update the search query on every keystroke
            placeholder="Search by user ID or message..."
            className="px-4 py-2 border border-gray-300 rounded-lg w-full"
          />
        </div>

        {/* Display Search Results or Full User List */}
        {searchQuery.trim() ? (
          <div>
            <h2 className="text-xl font-bold p-4 border-b border-gray-300">
              Search Results
            </h2>
            <ul>
              {filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                  <li
                    key={msg.id}
                    className="p-4 cursor-pointer hover:bg-blue-100"
                    onClick={() => handleSearchResultClick(msg.user_id)}
                  >
                    <p>
                      <strong>User ID:</strong> {msg.user_id}
                    </p>
                    <p className="text-gray-600">{msg.message_body}</p>
                  </li>
                ))
              ) : (
                <p className="p-4 text-gray-500">No results found.</p>
              )}
            </ul>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold p-4 border-b border-gray-300">
              Users
            </h2>
            {loading ? (
              <p className="text-gray-700 p-4">Loading users...</p>
            ) : error ? (
              <p className="text-red-500 p-4">{error}</p>
            ) : (
              <ul>
                {Object.keys(groupedMessages).map((userId) => (
                  <li
                    key={userId}
                    className={`p-4 cursor-pointer hover:bg-blue-100 ${
                      selectedUserId === userId ? "bg-blue-200" : ""
                    }`}
                    onClick={() => handleUserClick(userId)}
                  >
                    User ID: {userId}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Right Chat Panel */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-300 bg-white">
          <h2 className="text-xl font-bold">
            Chat with User ID: {selectedUserId}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedUserId && groupedMessages[selectedUserId] ? (
            groupedMessages[selectedUserId].map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  <p className="text-sm">{msg.message_body}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleString()} -{" "}
                    <strong>Status:</strong> {msg.status}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              Select a user to view their messages.
            </p>
          )}
        </div>
        <div className="p-4 border-t border-gray-300 bg-white">
          <form onSubmit={handleReply} className="flex gap-2">
            <input
              type="text"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentPortal;
