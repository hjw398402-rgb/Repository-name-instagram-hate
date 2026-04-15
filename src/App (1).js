import { useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { BsThreeDots, BsChat, BsCursor, BsBookmark } from "react-icons/bs";
import "./App.css";

// 임시 게시물 데이터
const INITIAL_POSTS = [
  {
    id: 1,
    user: "user_01",
    avatar: "https://i.pravatar.cc/40?img=1",
    image: "https://picsum.photos/seed/post1/600/600",
    caption: "오늘 하루도 좋은 하루 😊",
    likes: 128,
    liked: false,
    comments: [
      { id: 1, user: "friend_01", text: "완전 좋다!", blind: false },
      { id: 2, user: "friend_02", text: "부럽다 ㅠㅠ", blind: false },
    ],
  },
  {
    id: 2,
    user: "user_02",
    avatar: "https://i.pravatar.cc/40?img=2",
    image: "https://picsum.photos/seed/post2/600/600",
    caption: "주말 나들이 🌿",
    likes: 256,
    liked: false,
    comments: [
      { id: 1, user: "friend_03", text: "어디야?? 나도 가고싶다", blind: false },
    ],
  },
];

// 혐오표현 탐지 API 호출
const checkHate = async (text) => {
  try {
    const response = await fetch("http://localhost:8000/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    return data.is_hate;
  } catch (error) {
    // API 연결 전 임시: 무조건 false 반환
    console.log("API 미연결 상태 - 혐오표현 탐지 비활성화");
    return false;
  }
};

// 댓글 컴포넌트
function Comments({ comments, postId, onAddComment }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    const isHate = await checkHate(input.trim());
    onAddComment(postId, input.trim(), isHate);
    setInput("");
    setLoading(false);
  };

  return (
    <div className="comments-section">
      {/* 댓글 목록 */}
      <ul className="comment-list">
        {comments.map((c) => (
          <li key={c.id} className="comment-item">
            {c.blind ? (
              <span className="blind-comment">🚫 블라인드 처리된 댓글입니다.</span>
            ) : (
              <>
                <span className="comment-user">{c.user}</span>
                <span className="comment-text">{c.text}</span>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* 댓글 입력 */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          className="comment-input"
          type="text"
          placeholder="댓글 달기..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          className="comment-submit"
          type="submit"
          disabled={!input.trim() || loading}
        >
          {loading ? "확인 중..." : "게시"}
        </button>
      </form>
    </div>
  );
}

// 피드 카드 컴포넌트
function FeedCard({ post, onLike, onAddComment }) {
  return (
    <div className="feed-card">
      {/* 헤더 */}
      <div className="feed-header">
        <div className="feed-user-info">
          <img src={post.avatar} alt={post.user} className="avatar" />
          <span className="username">{post.user}</span>
        </div>
        <BsThreeDots className="more-icon" />
      </div>

      {/* 이미지 */}
      <img src={post.image} alt="post" className="feed-image" />

      {/* 액션 버튼 */}
      <div className="feed-actions">
        <div className="action-left">
          <button className="action-btn" onClick={() => onLike(post.id)}>
            {post.liked
              ? <AiFillHeart className="heart-icon liked" />
              : <AiOutlineHeart className="heart-icon" />}
          </button>
          <button className="action-btn">
            <BsChat className="action-icon" />
          </button>
          <button className="action-btn">
            <BsCursor className="action-icon" />
          </button>
        </div>
        <button className="action-btn">
          <BsBookmark className="action-icon" />
        </button>
      </div>

      {/* 좋아요 수 */}
      <div className="feed-likes">좋아요 {post.likes}개</div>

      {/* 캡션 */}
      <div className="feed-caption">
        <span className="username">{post.user}</span>
        <span className="caption-text"> {post.caption}</span>
      </div>

      {/* 댓글 */}
      <Comments
        comments={post.comments}
        postId={post.id}
        onAddComment={onAddComment}
      />
    </div>
  );
}

// 메인 앱
export default function App() {
  const [posts, setPosts] = useState(INITIAL_POSTS);

  const handleLike = (postId) => {
    setPosts(posts.map((p) =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  const handleAddComment = (postId, text, isHate) => {
    setPosts(posts.map((p) => {
      if (p.id !== postId) return p;
      const newComment = {
        id: p.comments.length + 1,
        user: "나",
        text,
        blind: isHate,
      };
      return { ...p, comments: [...p.comments, newComment] };
    }));
  };

  return (
    <div className="app">
      {/* 네비게이션 */}
      <nav className="navbar">
        <div className="nav-inner">
          <span className="nav-logo">Instagram</span>
          <div className="nav-icons">
            <AiOutlineHeart size={24} />
            <BsChat size={24} />
          </div>
        </div>
      </nav>

      {/* 피드 */}
      <main className="feed-container">
        {posts.map((post) => (
          <FeedCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onAddComment={handleAddComment}
          />
        ))}
      </main>
    </div>
  );
}
