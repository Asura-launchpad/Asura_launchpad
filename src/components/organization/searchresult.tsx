import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { searchAgentToken } from '../../api/agent';
import styles from './searchresult.module.scss';

interface SearchResultProps {
  query: string;
}

const SearchResult: React.FC<SearchResultProps> = ({ query }) => {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await searchAgentToken(query);
        setSearchResults(response.results.slice(0, 10)); // 최대 10개로 제한
      } catch (err: any) {
        setError(err.message || '검색 중 오류가 발생했습니다.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const handleResultClick = (contractAddress: string) => {
    router.push(`/${contractAddress}`);
  };

  if (isLoading) {
    return <div className={styles.loading}>loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (searchResults.length === 0 && query.trim()) {
    return <div className={styles.noResults}>No results found</div>;
  }

  return (
    <div className={styles.searchResultContainer}>
      {searchResults.map((result, index) => (
        <div
          key={index}
          className={styles.resultItem}
          onClick={() => handleResultClick(result.agent_token.contract_address)}
        >
          <Image
            src={result.persona.profile_image || '/default_profile.png'}
            alt={result.persona.name}
            width={40}
            height={40}
            className={styles.profileImage}
          />
          <div className={styles.resultInfo}>
            <h3 className={styles.name}>{result.persona.name}</h3>
            <p className={styles.description}>{result.persona.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResult;


