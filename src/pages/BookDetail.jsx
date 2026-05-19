import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useBooksStore } from "../stores/booksStore";
import Reviews from "../components/Reviews";
import { useFetchShelves } from "../hooks/useFetchShelves";
import { useEffect, useState } from "react";
import AddToShelfDropdown from "../components/AddToShelfDropdown";
import { sendRequest } from "../utils/sendRequest";
import { useFetchBookById } from "../hooks/useFetchBookById";
import UploadFieldWithProgress from "../components/UploadFieldWithProgress";
import {
  Button,
  Grid,
  Image,
  Rating,
  Stack,
  Text,
  Title,
  Group,
  Paper,
} from "@mantine/core";
import { ChevronLeft } from "lucide-react";

const PLACEHOLDER_BOOK_COVER_URL =
  "https://placehold.co/500x500/f8dfcc/703c1c/png?text=No+Cover";

export default function BookDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { fetchBookById, book, setBook, isLoading } = useFetchBookById();
  // progress bar state for cover upload
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  // find book either in route state or in books store previously fetched.
  useEffect(() => {
    fetchBookById(id);
  }, [fetchBookById, id]);

  const deleteBook = useBooksStore((s) => s.deleteBook);

  //shelves
  const { fetchShelves, shelves } = useFetchShelves();

  const { isLoggedIn, currentUser } = useAuthStore();

  const isOwner = book
    ? isLoggedIn && currentUser?.authorId === book.author._id
    : false;

  const navigate = useNavigate();
  const handleDelete = async () => {
    await deleteBook(id);
    navigate("/books");
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("cover", file);

    try {
      setIsUploading(true);
      await sendRequest({
        url: `/books/${id}/cover`,
        method: "post",
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      });

      setIsUploading(false);
      navigate(`/books/${id}`, {
        state: {
          fetchBook: true,
        },
      });
    } catch (error) {
      console.error("Failed to upload cover", error);
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchShelves({ withCredentials: true });
  }, [fetchShelves]);

  if (isLoading) return <p>Loading book...</p>;
  const descriptionSection = ({ title, desc }) => {
    return (
      <>
        <Text component="dt" fw={"bold"} c={"copper.5"}>
          {title}
        </Text>
        <Text component="dd" fw={"lighter"} pl={"xl"}>
          {desc}
        </Text>
      </>
    );
  };
  return (
    <article>
      {book ? (
        <Paper p={24}>
          <header style={{ paddingBottom: "2rem" }}>
            <Link to="/books" style={{ display: "block" }}>
              <Button variant="outline" radius={"xl"}>
                <ChevronLeft strokeWidth={4} />
              </Button>
            </Link>
            <Title order={2} c={"copper.6"}>
              {book.title}
            </Title>
            <Text c={"dimmed"}>by {book.author.penName}</Text>
          </header>

          <Grid gutter={0}>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Image
                h={500}
                w={300}
                src={book.coverImage || PLACEHOLDER_BOOK_COVER_URL}
                alt={book.title}
                radius={5}
                fallbackSrc={PLACEHOLDER_BOOK_COVER_URL}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack component={"dl"}>
                {book.genre &&
                  descriptionSection({
                    title: "Genre",
                    desc: `${book.genre}`,
                  })}

                {book.publishedYear &&
                  descriptionSection({
                    title: "Published Year",
                    desc: `${book.publishedYear}`,
                  })}
                {book.averageRating >= 0 &&
                  descriptionSection({
                    title: "Rating",
                    desc: (
                      <Rating
                        contentEditable={false}
                        value={book.averageRating}
                      />
                    ),
                  })}

                {descriptionSection({
                  title: "Description",
                  desc: `${book.description}`,
                })}
              </Stack>
            </Grid.Col>
          </Grid>
          <footer style={{ marginTop: "2rem" }}>
            <AddToShelfDropdown shelves={shelves} book={book} />
            {isOwner && (
              <Stack mt={24}>
                <Group>
                  <Link
                    to={`/books/${id}/edit`}
                    role="button"
                    className="secondary"
                  >
                    <Button>Edit</Button>
                  </Link>

                  <Button bg="brick.7" onClick={handleDelete}>
                    Delete
                  </Button>
                </Group>
                <UploadFieldWithProgress
                  title="Update Cover Image"
                  uploadHandler={handleCoverUpload}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
              </Stack>
            )}
          </footer>
        </Paper>
      ) : (
        "loading book..."
      )}

      <Reviews bookId={id} />
    </article>
  );
}
