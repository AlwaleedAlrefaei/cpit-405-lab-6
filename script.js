// -------------------- Cookie helper functions --------------------

function setCookie(name, value, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)};` +
    `expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const cookieName = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();

    if (cookie.startsWith(cookieName)) {
      return decodeURIComponent(cookie.substring(cookieName.length));
    }
  }

  return null;
}

function deleteCookie(name) {
  document.cookie =
    `${encodeURIComponent(name)}=;` +
    `expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
}

// -------------------- Initial application state --------------------

let likes = Number(getCookie("likes")) || 0;
let dislikes = Number(getCookie("dislikes")) || 0;

let comments = [];
const savedComments = getCookie("comments");

if (savedComments) {
  try {
    comments = JSON.parse(savedComments);
  } catch (error) {
    comments = [];
  }
}

// -------------------- DOM elements --------------------

const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const likeCount = document.getElementById("likeCount");
const dislikeCount = document.getElementById("dislikeCount");
const voteMessage = document.getElementById("voteMessage");

const commentInput = document.getElementById("commentInput");
const submitCommentBtn = document.getElementById("submitCommentBtn");
const commentMessage = document.getElementById("commentMessage");
const commentsList = document.getElementById("commentsList");

const resetBtn = document.getElementById("resetBtn");

// -------------------- UI functions --------------------

function updateCounters() {
  likeCount.textContent = likes;
  dislikeCount.textContent = dislikes;
}

function updateVotingState() {
  const vote = getCookie("vote");

  if (vote) {
    likeBtn.disabled = true;
    dislikeBtn.disabled = true;
    voteMessage.textContent =
      `You already voted: ${vote === "like" ? "Like" : "Dislike"}.`;
  } else {
    likeBtn.disabled = false;
    dislikeBtn.disabled = false;
    voteMessage.textContent = "";
  }
}

function updateCommentState() {
  const hasCommented = getCookie("hasCommented");

  if (hasCommented) {
    commentInput.disabled = true;
    submitCommentBtn.disabled = true;
    commentMessage.textContent =
      "You already submitted a comment. Reset to comment again.";
  } else {
    commentInput.disabled = false;
    submitCommentBtn.disabled = false;
    commentMessage.textContent = "";
  }
}

function displayComments() {
  commentsList.innerHTML = "";

  if (comments.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No comments yet.";
    commentsList.appendChild(item);
    return;
  }

  comments.forEach((comment) => {
    const item = document.createElement("li");

    // textContent is used instead of innerHTML so user input is treated as text.
    item.textContent = comment;

    commentsList.appendChild(item);
  });
}

function updateUI() {
  updateCounters();
  updateVotingState();
  updateCommentState();
  displayComments();
}

// -------------------- Like / dislike events --------------------

likeBtn.addEventListener("click", () => {
  if (getCookie("vote")) {
    voteMessage.textContent = "You can only vote once.";
    return;
  }

  likes++;
  setCookie("likes", likes);
  setCookie("vote", "like");

  updateUI();
});

dislikeBtn.addEventListener("click", () => {
  if (getCookie("vote")) {
    voteMessage.textContent = "You can only vote once.";
    return;
  }

  dislikes++;
  setCookie("dislikes", dislikes);
  setCookie("vote", "dislike");

  updateUI();
});

// -------------------- Comment event --------------------

submitCommentBtn.addEventListener("click", submitComment);

commentInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitComment();
  }
});

function submitComment() {
  if (getCookie("hasCommented")) {
    commentMessage.textContent = "You can only comment once.";
    return;
  }

  const comment = commentInput.value.trim();

  if (comment === "") {
    commentMessage.textContent = "Please enter a comment first.";
    return;
  }

  comments.push(comment);

  setCookie("comments", JSON.stringify(comments));
  setCookie("hasCommented", "true");

  commentInput.value = "";

  updateUI();
}

// -------------------- Reset event --------------------

resetBtn.addEventListener("click", () => {
  const confirmed = confirm(
    "Are you sure you want to reset your vote and comments?"
  );

  if (!confirmed) {
    return;
  }

  deleteCookie("vote");
  deleteCookie("likes");
  deleteCookie("dislikes");
  deleteCookie("comments");
  deleteCookie("hasCommented");

  likes = 0;
  dislikes = 0;
  comments = [];

  commentInput.value = "";
  voteMessage.textContent = "";
  commentMessage.textContent = "";

  updateUI();

  alert("Your vote and comments have been reset.");
});

// Load any saved cookie state when the page opens.
updateUI();
