async function fetchUserData() {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/users/1"
    );

    const data = await response.json();

    console.log(data);

    const postsResponse = await fetch(
      "https://jsonplaceholder.typicode.com/posts?userId=1"
    );

    const posts = await postsResponse.json();

    console.log(posts);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

fetchUserData();
