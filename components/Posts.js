import Post from "./Post";
import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log("Fetching posts...");
        const postsRef = collection(db, "posts");
        const q = query(postsRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          console.log("Snapshot received:", snapshot.docs.length, "documents");
          const postsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("Post data:", data); // Debug için
            return {
              id: doc.id,
              ...data,
              // Geriye uyumluluk için
              image: data.images ? data.images[0] : data.image,
            };
          });
          setPosts(postsData);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  console.log("Current posts state:", posts);

  return (
    <div>
      {posts.map((post) => (
        <Post
          key={post.id}
          id={post.id}
          username={post.username}
          userImg={post.profileImg}
          img={post.image}
          images={post.images}
          caption={post.caption}
          location={post.location}
          hashtags={post.hashtags}
          taggedUsers={post.taggedUsers}
        />
      ))}
    </div>
  );
}

export default Posts;
