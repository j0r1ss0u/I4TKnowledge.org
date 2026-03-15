// src/Components/About/Pressrelease.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import DocumentViewer from '../Library/components/DocumentViewer';
import LargeDocumentViewer from '../Library/components/LargeDocumentViewer';

const Pressrelease = () => {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPressReleases = async () => {
      try {
        setIsSearching(true);
        const documentsRef = collection(db, 'web3IP');
        const q = query(documentsRef, where('categories', 'array-contains', 'Press Release'));
        const snapshot = await getDocs(q);

        const pressReleases = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          validationStatus: doc.data().validationStatus || "PENDING"
        }));

        const formattedResults = pressReleases
          .map(result => ({
            id: result.id,
            title: result.title,
            excerpt: result.description || result.excerpt,
            author: result.author || result.creatorAddress,
            ipfsCid: result.ipfsCid,
            createdAt: result.createdAt,
            date: result.createdAt 
              ? new Date(result.createdAt.seconds * 1000).toLocaleDateString()
              : new Date().toLocaleDateString()
          }))
          .sort((a, b) => {
            const dateA = a.createdAt?.seconds 
              ? new Date(a.createdAt.seconds * 1000) 
              : new Date();
            const dateB = b.createdAt?.seconds 
              ? new Date(b.createdAt.seconds * 1000) 
              : new Date();
            return dateB - dateA;
          });
        setResults(formattedResults);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error loading press releases: ' + err.message);
      } finally {
        setIsSearching(false);
      }
    };

    fetchPressReleases();
  }, []);

  const renderLatestPressRelease = () => {
    const latest = results[0];
    if (!latest) return null;

    return (
      <article className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <h3 className="text-2xl font-semibold mb-3">{latest.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span>{latest.author}</span>
            <span>•</span>
            <span>{latest.date}</span>
          </div>
          <div className="flex flex-col gap-6">
            {latest.ipfsCid && (
              <LargeDocumentViewer 
                documentCid={latest.ipfsCid.replace('ipfs://', '')} 
              />
            )}
            <div className="bg-white/80 p-6 rounded-lg">
              <p className="text-gray-600">{latest.excerpt}</p>
            </div>
          </div>
        </div>
      </article>
    );
  };

  const renderOlderPressReleases = () => {
    const older = results.slice(1);
    if (older.length === 0) return null;

    return (
      <div className="grid grid-cols-1 gap-6">
        {older.map((result) => (
          <article key={result.id} className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{result.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>{result.author}</span>
                <span>•</span>
                <span>{result.date}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="w-full md:col-span-1">
                  {result.ipfsCid && (
                    <DocumentViewer documentCid={result.ipfsCid.replace('ipfs://', '')} />
                  )}
                </div>
                <div className="md:col-span-3">
                  <p className="text-gray-600">{result.excerpt}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="font-serif text-2xl font-bold mb-6">Press Releases</h2>
      {error && (
        <div className="text-red-600 mb-4 text-center">{error}</div>
      )}

      {isSearching ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : results.length > 0 ? (
        <>
          {renderLatestPressRelease()}
          {renderOlderPressReleases()}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No press releases found
        </div>
      )}
    </div>
  );
};

export default Pressrelease;