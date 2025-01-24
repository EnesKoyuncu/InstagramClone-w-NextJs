import Post from "./Post";
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log("Fetching posts...");
        const postsRef = collection(db, "posts");

        // Önce normal getDocs ile deneyelim
        const querySnapshot = await getDocs(postsRef);
        console.log("Direct query result:", querySnapshot.docs.length);

        // Sonra realtime listener ekleyelim
        const q = query(postsRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            console.log(
              "Snapshot received:",
              snapshot.docs.length,
              "documents"
            );
            const postsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setPosts(postsData);
          },
          (error) => {
            console.error("Snapshot error:", error);
          }
        );

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
          caption={post.caption}
        />
      ))}
    </div>
  );
}

export default Posts;
