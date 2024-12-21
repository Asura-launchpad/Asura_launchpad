import React from 'react';
import PostCard from '../../cell/postcard';
import styles from './postlist.module.scss';

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
  return (
    
    <div className={styles.postList}>
      {posts.map((post, index) => (
        <PostCard
          key={index}
          profileImg={post.profileImg}
          username={post.username}
          clientName={post.clientName}
          post={post.post}
          date={post.date}
        />
      ))}
    </div>
  );
};

export default Board;
