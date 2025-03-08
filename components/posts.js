'use client';

import { formatDate } from '@/lib/format';
import LikeButton from './like-icon';
import {togglePostLikeStatus} from "@/actions/posts";
import {useOptimistic} from "react";

function Post({ post, action }) {
  return (
    <article className="post">
      <div className="post-image">
        <img src={post.image} alt={post.title} />
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2>
            <p>
              Shared by {post.userFirstName} on{' '}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form action={action.bind(null, post.id)} className={post.isLiked ? 'liked' : ''}>
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

  // 낙관적 업데이트

  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(posts, (prevPosts, updatedPostId) => {
    // useOptimistic 훅을 사용하여 낙관적 UI 업데이트를 위한 상태와 업데이트 함수를 생성합니다.
    // posts: 초기 상태 값으로, 게시글 목록을 나타냅니다.
    // (prevPosts, updatedPostId) => { ... }: 업데이트 함수로, 상태를 어떻게 변경할지 정의합니다.
    // prevPosts: 이전 상태 값 (게시글 목록)
    // updatedPostId: 업데이트할 게시글의 ID

    // 업데이트된 인덱스 찾음
    const updatedPostIndex = prevPosts.findIndex(post => post.id === updatedPostId);
    // findIndex를 사용하여 이전 게시글 목록(prevPosts)에서 업데이트할 게시글의 인덱스를 찾습니다.
    // post.id가 updatedPostId와 일치하는 게시글의 인덱스를 반환합니다.
    // 일치하는 게시글이 없으면 -1을 반환합니다.

    // 없으면 업데이트 전 게시글 으로,
    if (updatedPostIndex === -1) {
      return prevPosts;
    }
    // 업데이트할 게시글을 찾지 못한 경우 (updatedPostIndex가 -1인 경우),
    // 이전 게시글 목록(prevPosts)을 그대로 반환하여 상태를 변경하지 않습니다.
    const updatedPost = { ...prevPosts[updatedPostIndex] };
    // 업데이트할 게시글의 복사본을 생성합니다.
    // 스프레드 연산자(...)를 사용하여 이전 게시글의 속성을 복사합니다.
    updatedPost.likes = updatedPost.likes + (updatedPost.isLiked ? -1 : 1);
    // 게시글의 좋아요 수를 업데이트합니다.
    // updatedPost.isLiked가 true이면 좋아요 수를 1 감소시키고, false이면 1 증가시킵니다.
    updatedPost.isLiked = !updatedPost.isLiked;
    // 게시글의 좋아요 상태(isLiked)를 반전시킵니다.
    const newPosts = [...prevPosts];
    // 이전 게시글 목록의 복사본을 생성합니다.
    newPosts[updatedPostIndex] = updatedPost;
    // 복사본에서 업데이트된 게시글을 새로운 게시글로 교체합니다.

    console.log(newPosts)
    return newPosts;
    // 업데이트된 게시글 목록(newPosts)을 반환하여 상태를 업데이트합니다.
  });

  if (!optimisticPosts || optimisticPosts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }

  //async 사용시 자연스럽게 use server 사용 안쓰면 use client
  async function updatePost(postId) {
    updateOptimisticPosts(postId);
    try {
      await togglePostLikeStatus(postId);
    } catch (err) {
      updateOptimisticPosts(postId);
    }
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
