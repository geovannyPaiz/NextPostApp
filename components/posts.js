"use client";
import { formatDate } from "@/lib/format";
import LikeButton from "./like-icon";
import { tooglePostLikeStatus } from "@/actions/posts";
import { useOptimistic } from "react";
import Image from "next/image";

function imageLoader(config) {
  const urlStart = config.src.split("upload/")[0];
  const urlEnd = config.src.split("upload/")[1];
  const transformations = `w_200,q_${config.quality}`;
  return `${urlStart}upload/${transformations}/${urlEnd}`;
}

function Post({ post, action }) {
  return (
    <article className="post">
      <div className="post-image">
        <Image
          loader={imageLoader}
          src={post.image}
          width={200}
          height={120}
          alt={post.title}
          quality={50}
        />
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2>
            <p>
              Shared by {post.userFirstName} on{" "}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form
              action={action.bind(null, post.id)}
              className={post.isLiked ? "liked" : ""}
            >
              <LikeButton />
            </form>
          </div>
        </header>
        <p>{post.content}</p>
      </div>
    </article>
  );
}

export default function Posts({ posts }) {
  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(
    posts,
    (prevPost, updatedPostId) => {
      const updatedPostIndex = prevPost.findIndex(
        (post) => post.id === updatedPostId
      );
      if (updatedPostIndex === -1) {
        return prevPost;
      }
      const updtaedPost = { ...prevPost[updatedPostIndex] };
      updtaedPost.likes = updtaedPost.likes + (updtaedPost.isLiked ? -1 : 1);
      updtaedPost.isLiked = !updtaedPost.isLiked;
      const newPosts = [...prevPost];
      newPosts[updatedPostIndex] = updtaedPost;
      return newPosts;
    }
  );
  if (!optimisticPosts || optimisticPosts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }

  async function updatePost(postId) {
    updateOptimisticPosts(postId);
    await tooglePostLikeStatus(postId);
  }

  return (
    <ul className="posts">
      {optimisticPosts.map((post) => (
        <li key={post.id}>
          <Post post={post} action={updatePost} />
        </li>
      ))}
    </ul>
  );
}
