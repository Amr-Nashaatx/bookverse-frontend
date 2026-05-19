import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { sendRequest } from "../utils/sendRequest";
import { toast } from "react-toastify";

const getRequestType = (book) => book.reviewRequest?.requestedStatus;
const hasPendingRequest = (book) =>
  !!book.reviewRequest && !book.reviewRequest.reviewedAt;

export default function AdminRequests() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [rejectionReasons, setRejectionReasons] = useState({});
  const pendingBooks = useMemo(
    () =>
      books.filter((book) => {
        if (!hasPendingRequest(book)) return false;
        if (filter === "all") return true;
        return getRequestType(book) === filter;
      }),
    [books, filter],
  );

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      const data = await sendRequest({ url: "/admin/books/pending" });
      setBooks(data.books ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load admin review requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleApprove = async (book) => {
    const requestType = getRequestType(book);
    const endpoint =
      requestType === "published"
        ? `/admin/books/${book._id}/approve-publish`
        : `/admin/books/${book._id}/approve-archive`;

    try {
      await sendRequest({ url: endpoint, method: "post" });
      setBooks((prev) => prev.filter((item) => item._id !== book._id));
      toast.success("Request approved.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve request.");
    }
  };

  const handleReject = async (book) => {
    const requestType = getRequestType(book);
    const endpoint =
      requestType === "published"
        ? `/admin/books/${book._id}/reject-publish`
        : `/admin/books/${book._id}/reject-archive`;

    try {
      await sendRequest({
        url: endpoint,
        method: "post",
        body: {
          rejectionReason: rejectionReasons[book._id] ?? "",
        },
      });
      setBooks((prev) => prev.filter((item) => item._id !== book._id));
      toast.success("Request rejected.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject request.");
    }
  };

  return (
    <Stack gap="lg">
      <Card p="xl">
        <Stack gap="lg">
          <div>
            <Title order={2} c="copper.6" fz={32}>
              Review Requests
            </Title>
            <Text c="dimmed" mt={6}>
              Review pending publish and archive requests from authors.
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
                  <Table.Th>Request</Table.Th>
                  <Table.Th>Reason</Table.Th>
                  <Table.Th ta="right">Actions</Table.Th>
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
                        {getRequestType(book)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Textarea
                        size="xs"
                        placeholder="Optional rejection reason"
                        value={rejectionReasons[book._id] ?? ""}
                        onChange={(event) =>
                          setRejectionReasons((prev) => ({
                            ...prev,
                            [book._id]: event.target.value,
                          }))
                        }
                        minRows={2}
                      />
                    </Table.Td>
                    <Table.Td ta="right">
                      <Group justify="flex-end">
                        <Button size="xs" onClick={() => handleApprove(book)}>
                          Approve
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          color="brick"
                          onClick={() => handleReject(book)}
                        >
                          Reject
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Text c="dimmed">No pending review requests right now.</Text>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
