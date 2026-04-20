import { useState } from "react";
import { AiOutlineHeart, AiFillHeart, AiOutlineBell } from "react-icons/ai";
import { BsThreeDots, BsChat, BsCursor, BsBookmark } from "react-icons/bs";
import "./App.css";

const INITIAL_POSTS = [
  {
    id: 1,
    user: "user_01",
    avatar: "https://i.pravatar.cc/40?img=1",
    image: "https://picsum.photos/seed/post1/800/800",
    caption: "오늘 하루도 좋은 하루 😊 #데일리",
    likes: 128,
    liked: false,
    comments: [
      { id: 1, user: "friend_01", text: "뷰우우우byu응!신이나", blind: false },
      { id: 2, user: "friend_02", text: "부럽다 ㅠㅠ", blind: false },
    ],
  },
];

const checkHate = async (text) => {
  try {
    const response = await fetch("https://jinwoo1251a-instagram-hate-detector.hf.space/predict", {


      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }),
    });
    const data = await response.json();
    return data.is_hate; 
  } catch (error) {
    return false;
  }
};

function Comments({ comments, postId, onAddComment }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    const isHate = await checkHate(input.trim());
    onAddComment(postId, input.trim(), isHate);
    setInput("");
    setLoading(false);
  };

  const handleReportSubmit = () => {
    if (!reportReason) return alert("신고 사유를 선택해주세요.");
    alert("신고를 완료하였습니다.");
    setIsModalOpen(false);
    setReportReason("");
    setOtherReason("");
  };

  return (
    <div className="comments-section-wrapper">
      {/* 1. 댓글 리스트 영역: 여기만 스크롤이 생깁니다 */}
      <div className="comment-list-container">
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment-item">
              <div className="comment-row">
                <div className="comment-main">
                  {c.blind ? (
                    <span className="blind-comment">🚫 블라인드 처리된 댓글입니다.</span>
                  ) : (
                    <>
                      <span className="comment-user">{c.user}</span>
                      <span className="comment-text">{c.text}</span>
                    </>
                  )}
                </div>
                <button className="report-bell-btn" onClick={() => setIsModalOpen(true)}>
                  <AiOutlineBell />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. 댓글 입력창 영역: 무조건 바닥에 고정됩니다 */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <input className="comment-input" type="text" placeholder="댓글 달기..." value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} />
        <button className="comment-submit" type="submit" disabled={!input.trim() || loading}>
          {loading ? "..." : "게시"}
        </button>
      </form>

      {/* 신고 모달 */}
      {isModalOpen && (
        <div className="modal-root">
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)} />
          <div className="modal-box">
            <div className="modal-header">
              <h2>신고하기</h2>
              <p>이 댓글을 신고하는 사유를 선택해주세요.</p>
            </div>
            <div className="modal-body">
              <select className="modal-select" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                <option value="">사유 선택</option>
                <option value="hate">혐오 표현 및 차별</option>
                <option value="spam">스팸 및 홍보</option>
                <option value="abuse">언어 폭력</option>
                <option value="other">기타</option>
              </select>
              <textarea className="modal-textarea" placeholder="구체적인 사유를 입력해주세요" value={otherReason} onChange={(e) => setOtherReason(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="confirm-btn" onClick={handleReportSubmit}>확인</button>
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedCard({ post, onLike, onAddComment }) {
  return (
    <div className="feed-card-pc">
      <div className="feed-left">
        <img src={post.image} alt="post" className="feed-image-pc" />
      </div>

      <div className="feed-right">
        <div className="feed-right-header">
          <div className="feed-user-info">
            <img src={post.avatar} alt={post.user} className="avatar" />
            <span className="username">{post.user}</span>
          </div>
          <BsThreeDots className="more-icon" />
        </div>

        {/* 캡션과 댓글 영역을 포함하는 메인 영역 */}
        <div className="feed-right-main">
          <div className="feed-caption">
            <span className="username">{post.user}</span>
            <span className="caption-text"> {post.caption}</span>
          </div>
          <Comments comments={post.comments} postId={post.id} onAddComment={onAddComment} />
        </div>

        <div className="feed-right-footer">
          <div className="feed-actions">
            <div className="action-left">
              <button className="action-btn" onClick={() => onLike(post.id)}>
                {post.liked ? <AiFillHeart className="heart-icon liked" /> : <AiOutlineHeart className="heart-icon" />}
              </button>
              <BsChat size={22} className="action-icon" />
              <BsCursor size={22} className="action-icon" />
            </div>
            <BsBookmark size={22} />
          </div>
          <div className="feed-likes">좋아요 {post.likes}개</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  
  const handleLike = (postId) => {
    setPosts(posts.map((p) => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p ));
  };
  
  const handleAddComment = (postId, text, isHate) => {
    setPosts(posts.map((p) => {
      if (p.id !== postId) return p;
      return { ...p, comments: [...p.comments, { id: Date.now(), user: "나", text, blind: isHate }] };
    }));
  };

  return (
    <div className="app">
      <nav className="navbar"><span className="nav-logo">Instagram</span></nav>
      <main className="feed-container">
        {posts.map((post) => ( 
          <FeedCard key={post.id} post={post} onLike={handleLike} onAddComment={handleAddComment} /> 
        ))}
      </main>
    </div>
  );
}