import { useState, useEffect } from 'react';

interface UploadLimit {
  id: number;
  category: string;
  max_size_mb: number;
}

interface UploadLimits {
  documents: number;
  videos: number;
  profile_pictures: number;
  chat_files: number;
}

const defaultLimits: UploadLimits = {
  documents: 10,
  videos: 200,
  profile_pictures: 5,
  chat_files: 10,
};

export function useUploadLimits() {
  const [limits, setLimits] = useState<UploadLimits>(defaultLimits);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const res = await fetch('/api/proxy/upload-limits', {
          credentials: 'include',
        });
        if (res.ok) {
          const data: UploadLimit[] = await res.json();
          const newLimits: UploadLimits = { ...defaultLimits };
          data.forEach((limit) => {
            if (limit.category in newLimits) {
              newLimits[limit.category as keyof UploadLimits] = limit.max_size_mb;
            }
          });
          setLimits(newLimits);
        }
      } catch {
        // Use default limits on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLimits();
  }, []);

  return { limits, isLoading };
}
