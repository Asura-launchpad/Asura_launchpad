import React, { useState } from 'react';
import styles from './board.module.scss';
import PostList from './postlist';

interface BoardProps {
  posts: {
    profileImg: string;
    username: string;
    clientName: string;
    post: string;
    date: string;
  }[];
}

const Board: React.FC<BoardProps> = ({ posts }) => {
  const [activeTab, setActiveTab] = useState<'comment' | 'chat' | 'transaction'>('comment');

  const renderContent = () => {
    switch(activeTab) {
      case 'comment':
        return <PostList posts={posts.filter(post => post.clientName === 'Comment')} />;
      case 'chat':
        return <PostList posts={posts.filter(post => post.clientName === 'Chat')} />;
      case 'transaction':
        return <PostList posts={posts.filter(post => post.clientName === 'Transaction')} />;
    }
  };

  return (
    <div className={styles.boardContainer}>
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'comment' ? styles.active : ''}`}
          onClick={() => setActiveTab('comment')}
        >
          Comments
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'chat' ? styles.active : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'transaction' ? styles.active : ''}`}
          onClick={() => setActiveTab('transaction')}
        >
          Transactions
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default Board;
