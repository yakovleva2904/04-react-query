import SearchBar from '../SearchBar/SearchBar.tsx';
import css from './App.module.css';
import fetchMovies from '../../services/movieService.ts';
import toast, { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import type { Movie } from '../../types/movie.ts';
import MovieGrid from '../MovieGrid/MovieGrid.tsx';
import Loader from '../Loader/Loader.tsx';
import ErrorMessage from '../ErrorMessage/ErrorMessage.tsx';
import MovieModal from '../MovieModal/MovieModal.tsx';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import ReactPaginate from 'react-paginate';
import { useEffect } from 'react';

export default function App() {
  const [name, setName] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const closeModal = () => {
    setSelectedMovie(null);
  };

  const handleSelect = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["films", name, page],
    queryFn: () => fetchMovies(name, page),
    enabled: name !== "",
    placeholderData: keepPreviousData,
  });

  const movies = data?.results ?? [];

  const totalPages = data?.total_pages ?? 0;

  useEffect(() => {
    if (!isLoading && data && data.results.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [data, isLoading]);

  const submitHandle = (nameMovie: string) => {
    setName(nameMovie);
    setPage(1)
  };

  return (
    <>
      <div className={css.App}>
        <SearchBar onSubmit={submitHandle} />
        {movies.length !== 0 && totalPages > 1 && <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />}
        <MovieGrid movies={movies} onSelect={handleSelect} />
        <Toaster />
        {isLoading && <Loader />}
        {isError && <ErrorMessage />}
        {selectedMovie && <MovieModal movie={selectedMovie} onClose={closeModal} />}
      </div>
    </>
  );
}
