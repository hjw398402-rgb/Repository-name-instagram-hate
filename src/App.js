import { useState, useRef } from "react";
import { AiOutlineHeart, AiFillHeart, AiOutlineBell, AiOutlineHome, AiOutlineUser, AiOutlinePlus } from "react-icons/ai";
import { BsChat, BsCursor, BsBookmark } from "react-icons/bs";
import "./App.css";

// 시연을 위해 미리 저장된 가짜 앨범 사진들
const PRESET_IMAGES = [
  "https://picsum.photos/seed/album1/800/800",
  "https://picsum.photos/seed/album2/800/800",
  "https://picsum.photos/seed/album3/800/800",
  "https://picsum.photos/seed/album4/800/800",
  "https://picsum.photos/seed/album5/800/800",
  "https://picsum.photos/seed/album6/800/800",
  "https://picsum.photos/seed/album7/800/800",
  "https://picsum.photos/seed/album8/800/800",
  "https://picsum.photos/seed/album9/800/800",
];

const INITIAL_POSTS = [
  { id: 1, user: "user_01", avatar: "https://i.pravatar.cc/40?img=1", image: "/watermelon.png", caption: "수박 팔아요 ㅋㅋ 😊 #데일리", likes: 128, liked: false, comments: [{ id: 1, user: "friend_01", text: "부럽다 ㅠㅠ", blind: false }, { id: 2, user: "friend_02", text: "뭐가 부럽다는거지", blind: false }, { id: 3, user: "friend_03", text: "가게에서 팔아라 좀", blind: false }] },
  { id: 2, user: "user_02", avatar: "https://i.pravatar.cc/40?img=2", image: "https://picsum.photos/seed/post2/800/800", caption: "오랜만에 외출! 날씨 너무 좋다 ☀️", likes: 45, liked: false, comments: [{ id: 3, user: "friend_03", text: "어디 갔어??", blind: false }] },
  { id: 3, user: "user_03", avatar: "https://i.pravatar.cc/40?img=3", image: "https://picsum.photos/seed/post3/800/800", caption: "맛있는 저녁 식사 🍽️ #먹스타그램", likes: 89, liked: true, comments: [] },
  { id: 4, user: "user_04", avatar: "https://i.pravatar.cc/40?img=4", image: "https://picsum.photos/seed/post4/800/800", caption: "코딩 공부 중... 💻 언제 다 하지", likes: 21, liked: false, comments: [{ id: 4, user: "friend_01", text: "파이팅!!", blind: false }] },
  { id: 5, user: "user_05", avatar: "https://i.pravatar.cc/40?img=5", image: "https://picsum.photos/seed/post5/800/800", caption: "귀여운 고양이 보고 가세요 🐈", likes: 302, liked: false, comments: [{ id: 5, user: "friend_04", text: "심쿵...", blind: false }, { id: 6, user: "friend_05", text: "너무 귀여워 ㅠㅠ", blind: false }] }
];

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8001";

const checkHate = async (text) => {
  try {
    const response = await fetch(`${API_URL}/check`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text }) });
    const data = await response.json(); return data.is_hate;
  } catch (error) { return false; }
};

function Comments({ comments, postId, onAddComment, onBlindComment }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hateAlert, setHateAlert] = useState(false);
  const [reportModal, setReportModal] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    const isHate = await checkHate(input.trim());
    if (isHate) { setHateAlert(true); setInput(""); setLoading(false); return; }
    onAddComment(postId, input.trim()); setInput(""); setLoading(false);
  };

  const handleReportSubmit = () => {
    if (!reportReason) return alert("신고 사유를 선택해주세요.");
    onBlindComment(postId, reportModal); setReportModal(null); setReportReason(""); setOtherReason("");
  };

  return (
    <div className="comments-section-wrapper">
      <div className="comment-list-container">
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment-item">
              <div className="comment-row">
                <div className="comment-main">{c.blind ? <span className="blind-comment">🚫 블라인드 처리된 댓글입니다.</span> : <><span className="comment-user">{c.user}</span><span className="comment-text">{c.text}</span></>}</div>
                {!c.blind && <button className="report-bell-btn" onClick={() => setReportModal(c.id)}><AiOutlineBell /></button>}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <form className="comment-form" onSubmit={handleSubmit}>
        <input className="comment-input" type="text" placeholder="댓글 달기..." value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} />
        <button className="comment-submit" type="submit" disabled={!input.trim() || loading}>{loading ? "..." : "게시"}</button>
      </form>
      {hateAlert && (
        <div className="modal-root" style={{ zIndex: 10005 }}>
          <div className="modal-overlay" onClick={() => setHateAlert(false)} />
          <div className="modal-box">
            <div className="hate-alert-icon">🚫</div><h2 className="hate-alert-title">혐오표현이 탐지되었습니다!</h2>
            <p className="hate-alert-desc">작성하신 내용에 혐오표현이 포함되어 있어 게시할 수 없습니다.</p>
            <button className="confirm-btn" style={{ width: "100%" }} onClick={() => setHateAlert(false)}>확인</button>
          </div>
        </div>
      )}
      {reportModal && (
        <div className="modal-root" style={{ zIndex: 10005 }}>
          <div className="modal-overlay" onClick={() => setReportModal(null)} />
          <div className="modal-box">
            <div className="modal-header"><h2>신고하기</h2><p>이 댓글을 신고하는 사유를 선택해주세요.</p></div>
            <div className="modal-body">
              <select className="modal-select" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                <option value="">사유 선택</option><option value="hate">혐오 표현 및 차별</option><option value="spam">스팸 및 홍보</option><option value="abuse">언어 폭력</option><option value="other">기타</option>
              </select>
              <textarea className="modal-textarea" placeholder="구체적인 사유를 입력해주세요" value={otherReason} onChange={(e) => setOtherReason(e.target.value)} />
            </div>
            <div className="modal-footer"><button className="confirm-btn" onClick={handleReportSubmit}>확인</button><button className="cancel-btn" onClick={() => setReportModal(null)}>취소</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedCard({ post, onLike, onAddComment, onBlindComment, onRemovePost }) {
  const [isPostReportModalOpen, setIsPostReportModalOpen] = useState(false);
  const [postReportReason, setPostReportReason] = useState("");
  const [postOtherReason, setPostOtherReason] = useState("");

  const handlePostReportSubmit = () => {
    if (!postReportReason) return alert("신고 사유를 선택해주세요.");
    alert("게시글 신고가 접수되어 화면에서 숨김 처리됩니다."); 
    onRemovePost(post.id); 
    setIsPostReportModalOpen(false);
  };

  return (
    <div className="feed-card-pc">
      <div className="feed-left"><img src={post.image} alt="post" className="feed-image-pc" /></div>
      <div className="feed-right">
        <div className="feed-right-header">
          <div className="feed-user-info"><img src={post.avatar} alt={post.user} className="avatar" /><span className="username">{post.user}</span></div>
          <AiOutlineBell size={22} color="#262626" style={{ cursor: "pointer" }} onClick={() => setIsPostReportModalOpen(true)} />
        </div>
        <div className="feed-right-main">
          <div className="feed-caption"><span className="username">{post.user}</span><span className="caption-text"> {post.caption}</span></div>
          <Comments comments={post.comments} postId={post.id} onAddComment={onAddComment} onBlindComment={onBlindComment} />
        </div>
        <div className="feed-right-footer">
          <div className="feed-actions">
            <div className="action-left">
              <button className="action-btn" onClick={() => onLike(post.id)}>
                {post.liked ? <AiFillHeart className="heart-icon liked" /> : <AiOutlineHeart className="heart-icon" />}
              </button>
              <BsChat size={22} className="action-icon" /><BsCursor size={22} className="action-icon" />
            </div>
            <BsBookmark size={22} />
          </div>
          <div className="feed-likes">좋아요 {post.likes}개</div> 
        </div>
      </div>

      {isPostReportModalOpen && (
        <div className="modal-root" style={{ zIndex: 10006 }}>
          <div className="modal-overlay" onClick={() => setIsPostReportModalOpen(false)} />
          <div className="modal-box">
            <div className="modal-header">
              <h2>신고하기</h2>
              <p>이 게시글을 신고하는 사유를 선택해주세요.</p>
            </div>
            <div className="modal-body">
              <select className="modal-select" value={postReportReason} onChange={(e) => setPostReportReason(e.target.value)}>
                <option value="">사유 선택</option>
                <option value="hate">혐오 표현 및 차별</option>
                <option value="spam">스팸 및 홍보</option>
                <option value="abuse">언어 폭력</option>
                <option value="other">기타</option>
              </select>
              <textarea className="modal-textarea" placeholder="구체적인 사유를 입력해주세요" value={postOtherReason} onChange={(e) => setPostOtherReason(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="confirm-btn" onClick={handlePostReportSubmit}>확인</button>
              <button className="cancel-btn" onClick={() => setIsPostReportModalOpen(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ⭐️ onPostClick 속성 추가 ⭐️
function Profile({ onCreatePostClick, myPosts, onPostClick }) {
  return (
    <div className="mobile-profile-container">
      <div className="mobile-top-bar">
        <span className="back-arrow">{"<"}</span>
        <span className="top-username">iwanttogohome</span>
        <span className="more-options">{"..."}</span>
      </div>

      <div className="mobile-profile-main">
        <div className="mobile-stats-row">
          <div className="avatar-wrapper">
            <img src="https://i.pravatar.cc/150?img=11" alt="profile" className="mobile-avatar" />
          </div>
          <div className="mobile-stats">
            <div className="stat-item">
              <span className="stat-number">{myPosts.length}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">12</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">712</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
        </div>

        <div className="mobile-bio-section">
          <div className="bio-name">안녕하세요ㅋ</div>
          <div className="bio-category">Blogger and programmer</div>
          <div className="bio-text">
            나를 위로해주는 것은 술과 담배뿐..#참이슬#진로
          </div>
        </div>

        <div className="mobile-action-buttons">
          <button className="mobile-btn blue-btn" onClick={onCreatePostClick}>
            게시물 작성
          </button>
          <button className="mobile-btn gray-btn">
            프로필 편집
          </button>
        </div>
      </div>
      
      <div className="profile-divider"></div>
      
      <div className="profile-grid">
        {myPosts.map((post) => (
          // ⭐️ 사진을 클릭하면 onPostClick 함수 실행 ⭐️
          <div key={post.id} className="grid-item" onClick={() => onPostClick(post)}>
            <img src={post.image} alt="my post" className="grid-image" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [currentView, setCurrentView] = useState("feed");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState("");
  const [newPostImage, setNewPostImage] = useState(null); 
  const [isCreating, setIsCreating] = useState(false);
  const [postHateAlert, setPostHateAlert] = useState(false);
  
  // ⭐️ 현재 선택된 상세 보기 게시글을 추적하는 상태 ⭐️
  const [selectedPost, setSelectedPost] = useState(null); 
  
  const fileInputRef = useRef(null);

  const myPosts = posts.filter(post => post.user === "iwanttogohome");

  const handleLike = (postId) => setPosts(posts.map((p) => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  const handleAddComment = (postId, text) => setPosts(posts.map((p) => { if (p.id !== postId) return p; return { ...p, comments: [...p.comments, { id: Date.now(), user: "iwanttogohome", text, blind: false }] }; }));
  const handleBlindComment = (postId, commentId) => setPosts(posts.map((p) => { if (p.id !== postId) return p; return { ...p, comments: p.comments.map((c) => c.id === commentId ? { ...c, blind: true } : c ) }; }));
  
  const handleRemovePost = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
    // 만약 현재 모달로 띄워진 게시글이 삭제되었다면 모달창도 닫아줌
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setNewPostImage(URL.createObjectURL(file));
  };

  const handleCreatePostSubmit = async () => {
    if (!newPostImage) return alert("사진을 선택하거나 업로드해주세요!");
    if (!newPostCaption.trim()) return alert("문구를 입력해주세요!");
    setIsCreating(true);
    const isHate = await checkHate(newPostCaption.trim());
    if (isHate) { setPostHateAlert(true); setIsCreating(false); return; }
    
    const newPost = { id: Date.now(), user: "iwanttogohome", avatar: "https://i.pravatar.cc/150?img=11", image: newPostImage, caption: newPostCaption, likes: 0, liked: false, comments: [] };
    setPosts([newPost, ...posts]); 
    closeModal(); setCurrentView("feed"); 
  };

  const closeModal = () => { setCreateModalOpen(false); setNewPostCaption(""); setNewPostImage(null); setIsCreating(false); };

  // 상세 모달에 넘겨줄 최신 게시물 데이터 (좋아요/댓글 실시간 반영)
  const currentSelectedPostData = selectedPost ? posts.find(p => p.id === selectedPost.id) : null;

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-content">
          <span className="nav-logo" onClick={() => setCurrentView("feed")}>Instagram</span>
          <div className="nav-icons">
            <AiOutlineHome className="nav-icon" onClick={() => setCurrentView("feed")} />
            <AiOutlineUser className="nav-icon" onClick={() => setCurrentView("profile")} />
          </div>
        </div>
      </nav>

      <main className="main-area">
        {currentView === "feed" ? (
          <div className="feed-container">
            {posts.map((post) => (
              <FeedCard 
                key={post.id} 
                post={post} 
                onLike={handleLike} 
                onAddComment={handleAddComment} 
                onBlindComment={handleBlindComment} 
                onRemovePost={handleRemovePost}
              />
            ))}
          </div>
        ) : (
          <Profile 
            onCreatePostClick={() => setCreateModalOpen(true)} 
            myPosts={myPosts} 
            onPostClick={(post) => setSelectedPost(post)} // ⭐️ 프로필에서 사진 클릭 시 상태 업데이트
          />
        )}
      </main>

      {/* ⭐️ 게시글 상세 보기 모달 ⭐️ */}
      {currentSelectedPostData && (
        <div className="modal-root" style={{ zIndex: 10003 }}>
          <div className="modal-overlay" onClick={() => setSelectedPost(null)} />
          <div className="post-detail-modal-wrapper">
            <button className="close-detail-btn" onClick={() => setSelectedPost(null)}>✕</button>
            <FeedCard 
              post={currentSelectedPostData} 
              onLike={handleLike} 
              onAddComment={handleAddComment} 
              onBlindComment={handleBlindComment} 
              onRemovePost={handleRemovePost}
            />
          </div>
        </div>
      )}

      {/* 새 게시물 만들기 모달 */}
      {isCreateModalOpen && (
        <div className="modal-root" style={{ zIndex: 10004 }}>
          <div className="modal-overlay" onClick={closeModal} />
          <div className="create-post-modal">
            <div className="create-post-header">
              <div style={{ width: '40px' }}></div>
              <h3>새 게시물 만들기</h3>
              <button className="share-btn" onClick={handleCreatePostSubmit} disabled={isCreating}>{isCreating ? "처리중..." : "공유하기"}</button>
            </div>
            
            <div className="create-post-body">
              <div className="create-post-image">
                {newPostImage ? (
                  <div className="selected-image-container">
                    <img src={newPostImage} alt="new post preview" />
                    <button className="reselect-btn" onClick={() => setNewPostImage(null)}>✕</button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
                      <AiOutlinePlus style={{ marginRight: '5px' }} /> 내 컴퓨터에서 선택
                    </button>
                    <input type="file" accept="image/*" style={{ display: "none" }} ref={fileInputRef} onChange={handleImageUpload} />
                    
                    <div className="divider-line"></div>
                    
                    <div className="album-section">
                      <h4>최근 항목</h4>
                      <div className="album-grid">
                        {PRESET_IMAGES.map((imgUrl, idx) => (
                          <div key={idx} className="album-item" onClick={() => setNewPostImage(imgUrl)}>
                            <img src={imgUrl} alt={`album-pic-${idx}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="create-post-form">
                <div className="profile-user-info">
                  <img src="https://i.pravatar.cc/150?img=11" alt="avatar" className="avatar" />
                  <span className="username">iwanttogohome</span>
                </div>
                <textarea className="caption-input" placeholder="문구 입력..." value={newPostCaption} onChange={(e) => setNewPostCaption(e.target.value)} />
              </div>
            </div>
          </div>

          {postHateAlert && (
            <div className="modal-root" style={{ zIndex: 10005 }}>
              <div className="modal-overlay" onClick={() => setPostHateAlert(false)} />
              <div className="modal-box">
                <div className="hate-alert-icon">🚫</div><h2 className="hate-alert-title">게시 불가 안내</h2>
                <p className="hate-alert-desc">작성하신 내용에서 <b>혐오표현 또는 부적절한 단어</b>가 탐지되어 게시글을 등록할 수 없습니다.</p>
                <button className="confirm-btn" style={{ width: "100%" }} onClick={() => setPostHateAlert(false)}>확인</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}