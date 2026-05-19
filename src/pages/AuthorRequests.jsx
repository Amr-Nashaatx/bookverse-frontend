import { useEffect, useMemo, useState } from "react";
import { Badge, Card, SegmentedControl, Stack, Table, Text, Title } from "@mantine/core";
import { sendRequest } from "../utils/sendRequest";
import { toast } from "react-toastify";

const hasPendingRequest = (book) =>
  !!book.reviewRequest && !book.reviewRequest.reviewedAt;

export default function AuthorRequests() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const pendingBooks = useMemo(
    () =>
      books.filter((book) => {
        if (!hasPendingRequest(book)) return false;
        if (filter === "all") return true;
        return book.reviewRequest?.requestedStatus === filter;
      }),
    [books, filter],
  );

  useEffect(() => {
    const fetchMyPendingRequests = async () => {
      try {
        setIsLoading(true);
        const data = await sendRequest({ url: "/books/my-books" });
        setBooks(data.books ?? []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load your pending requests.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPendingRequests();
  }, []);

  return (
    <Stack gap="lg">
      <Card p="xl">
        <Stack gap="lg">
          <div>
            <Title order={2} c="copper.6" fz={32}>
              My Requests
            </Title>
            <Text c="dimmed" mt={6}>
              Track publish and archive requests that are waiting for admin review.
            </Text>
          </div>

          <SegmentedControl
            value={filter}
            onChange={setFilter}
            data={[
              { label: "All", value: "all" },
              { label: "Publish", value: "published" },
              { label: "Archive", value: "archived" },
            ]}
          />

          {isLoading ? (
            <Text c="dimmed">Loading requests...</Text>
          ) : pendingBooks.length ? (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Book</Table.Th>
                  <Table.Th>Current Status</Table.Th>
                  <Table.Th>Pending Request</Table.Th>
                  <Table.Th>Requested On</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pendingBooks.map((book) => (
                  <Table.Tr key={book._id}>
                    <Table.Td>{book.title}</Table.Td>
                    <Table.Td>
                      <Badge color="copper" variant="light">
                        {book.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="moss" variant="light">
                        {book.reviewRequest?.requestedStatus}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {new Date(book.reviewRequest.requestedAt).toLocaleDateString()}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Text c="dimmed">You have no pending requests.</Text>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
