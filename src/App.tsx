import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { BrowsePage } from "./pages/BrowsePage";
import { CategoryBrowsePage } from "./pages/CategoryBrowsePage";
import { GPTSearchPage } from "./pages/GPTSearchPage";
import { MovieDetail } from "./components/MovieDetail";
import { TrailerModal } from "./components/TrailerModal";
import { MyListPage } from "./pages/MyListPage";
import { AuthPage } from "./pages/AuthPage";
import { Movie, Page } from "./types/movie";
import {
  fromStoredMovie,
  getMovieWithDetails,
  toStoredMovie,
  type StoredMovie,
} from "./data/mockMovies";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./config/firebase";

const getMyListStorageKey = (uid: string) => `netflixgpt:my-list:${uid}`;

function loadMyListFromLocalStorage(uid: string) {
  try {
    const storedMovies = JSON.parse(
      localStorage.getItem(getMyListStorageKey(uid)) || "[]",
    ) as StoredMovie[];
    return storedMovies.map(fromStoredMovie);
  } catch (error) {
    console.warn("Failed to load local My List fallback:", error);
    return [];
  }
}

function saveMyListToLocalStorage(uid: string, movies: Movie[]) {
  try {
    localStorage.setItem(
      getMyListStorageKey(uid),
      JSON.stringify(movies.map(toStoredMovie)),
    );
  } catch (error) {
    console.warn("Failed to save local My List fallback:", error);
  }
}

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
  const [myList, setMyList] = useState<Movie[]>([]);
  const [isMyListSyncing, setIsMyListSyncing] = useState(false);
  const [cloudSyncWarning, setCloudSyncWarning] = useState(false);

  useEffect(() => {
    const loadMyList = async () => {
      if (!currentUser?.uid) {
        setMyList([]);
        setCloudSyncWarning(false);
        return;
      }

      setIsMyListSyncing(true);
      try {
        const myListCollectionRef = collection(db, "users", currentUser.uid, "myList");
        const snapshot = await getDocs(myListCollectionRef);
        const firestoreMovies = snapshot.docs
          .map((movieDoc) => movieDoc.data() as StoredMovie)
          .map(fromStoredMovie);
        setMyList(firestoreMovies);
        saveMyListToLocalStorage(currentUser.uid, firestoreMovies);
        setCloudSyncWarning(false);
      } catch (error) {
        console.warn("Firestore blocked, using localStorage fallback", error);
        setMyList(loadMyListFromLocalStorage(currentUser.uid));
        setCloudSyncWarning(true);
      } finally {
        setIsMyListSyncing(false);
      }
    };

    loadMyList();
  }, [currentUser]);

  const handlePlayTrailer = async (movie: Movie) => {
    const movieWithTrailer = await getMovieWithDetails(movie);
    setTrailerMovie(movieWithTrailer);
  };

  const handleMoreInfo = async (movie: Movie) => {
    const detailedMovie = await getMovieWithDetails(movie);
    setSelectedMovie(detailedMovie);
  };

  const handleCloseDetail = () => {
    setSelectedMovie(null);
  };

  const handleCloseTrailer = () => {
    setTrailerMovie(null);
  };

  const toggleMyList = async (movie: Movie) => {
    if (!currentUser?.uid) {
      return;
    }

    const userId = currentUser.uid;
    const myListDocRef = doc(db, "users", userId, "myList", String(movie.id));
    const isSaved = myList.some((savedMovie) => savedMovie.id === movie.id);
    const nextMyList = isSaved
      ? myList.filter((savedMovie) => savedMovie.id !== movie.id)
      : [...myList, movie];

    setMyList(nextMyList);
    saveMyListToLocalStorage(userId, nextMyList);

    try {
      if (isSaved) {
        await deleteDoc(myListDocRef);
      } else {
        await setDoc(myListDocRef, toStoredMovie(movie));
      }
      setCloudSyncWarning(false);
    } catch (error) {
      console.warn("Firestore blocked, using localStorage fallback", error);
      setCloudSyncWarning(true);
    }
  };

  const isInMyList = (movieId: number) =>
    myList.some((movie) => movie.id === movieId);

  if (loading || isMyListSyncing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-zinc-700 border-t-red-600 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        myListCount={myList.length}
      />

      {cloudSyncWarning && (
        <div className="fixed left-1/2 top-20 z-[60] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-lg border border-yellow-300/25 bg-black/80 px-4 py-3 text-center text-sm font-medium text-yellow-100 shadow-2xl backdrop-blur-md">
          Note: Some browser extensions may block cloud sync. Disable ad blockers if My List doesn't sync.
        </div>
      )}

      {currentPage === "home" && (
        <BrowsePage
          onPlayTrailer={handlePlayTrailer}
          onMoreInfo={handleMoreInfo}
          toggleMyList={toggleMyList}
          isInMyList={isInMyList}
        />
      )}

      {currentPage === "gpt-search" && (
        <GPTSearchPage
          onPlayTrailer={handlePlayTrailer}
          onMoreInfo={handleMoreInfo}
          toggleMyList={toggleMyList}
          isInMyList={isInMyList}
        />
      )}

      {currentPage === "my-list" && (
        <MyListPage
          onPlayTrailer={handlePlayTrailer}
          onMoreInfo={handleMoreInfo}
          toggleMyList={toggleMyList}
          myListMovies={myList}
          onBrowse={() => setCurrentPage("home")}
        />
      )}

      {currentPage === "movies" && (
        <CategoryBrowsePage
          pageType="movies"
          onPlayTrailer={handlePlayTrailer}
          onMoreInfo={handleMoreInfo}
          toggleMyList={toggleMyList}
          isInMyList={isInMyList}
        />
      )}

      {currentPage === "tv-shows" && (
        <CategoryBrowsePage
          pageType="tv"
          onPlayTrailer={handlePlayTrailer}
          onMoreInfo={handleMoreInfo}
          toggleMyList={toggleMyList}
          isInMyList={isInMyList}
        />
      )}

      {selectedMovie && (
        <MovieDetail
          movie={selectedMovie}
          onClose={handleCloseDetail}
          onPlayTrailer={async () => {
            const movieWithTrailer = await getMovieWithDetails(selectedMovie);
            setTrailerMovie(movieWithTrailer);
            setSelectedMovie(null);
          }}
        />
      )}

      {trailerMovie && (
        <TrailerModal movie={trailerMovie} onClose={handleCloseTrailer} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
