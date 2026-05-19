import { Link } from "react-router-dom";
import {
  Card,
  Image,
  Text,
  Badge,
  Button,
  Group,
  Title,
  Stack,
} from "@mantine/core";
import "./BookCard.css";

export default function BookCard({ book, selectionMode, onAddBookToShelf }) {
  const CardContent = () => (
    <>
      {book.coverImage && (
        <Card.Section>
          <Image
            src={book.coverImage}
            height={470}
            alt={`Cover of ${book.title}`}
          />
        </Card.Section>
      )}
      <div className="book-card-content">
        <Stack gap={2}>
          <Title order={3} c={"copper.6"}>
            {book.title}
          </Title>
          <Text c={"dimmed"}>by {book.authorId.penName}</Text>
        </Stack>

        {selectionMode && (
          <Group className="book-card-actions">
            <Button variant="outline">
              <Link to={`/books/${book._id}`}>View</Link>
            </Button>
            <Button
              className="primary"
              onClick={(e) => {
                e.preventDefault();
                onAddBookToShelf(book._id);
              }}
            >
              Add To Shelf
            </Button>
          </Group>
        )}
      </div>
    </>
  );

  if (selectionMode) {
    return (
      <Card key={book._id} className="book-card" withBorder>
        <CardContent />
      </Card>
    );
  }

  return (
    <Link key={book._id} to={`/books/${book._id}`} className="book-card">
      <Card withBorder>
        <CardContent />
      </Card>
    </Link>
  );
}
