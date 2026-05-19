import {
  Check,
  Edit3,
  Eye,
  UploadCloud,
  Trash2,
  X,
  Share2Icon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { sendRequest } from "../utils/sendRequest";
import { ActionIcon, Badge, Group, Select, Table, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { toast } from "react-toastify";
import PublishBookConfirmation from "./PublishBookConfirmation";
import BookActionConfirmation from "./BookActionConfirmation";
import SharePreviewConfirmation from "./SharePreviewConfirmation";

export default function BooksTableRow({
  bookData,
  onDeleteBook,
  onBookStatusUpdated,
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [
    warningModalOpened,
    { open: warningModalOpen, close: warningModalClose },
  ] = useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [shareModalOpened, { open: shareModalOpen, close: shareModalClose }] =
    useDisclosure(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(bookData.status);
  const chapterCount = bookData.chapters?.length ?? 0;
  const hasPendingReviewRequest =
    !!bookData.reviewRequest && !bookData.reviewRequest.reviewedAt;
  const pendingRequestStatus = bookData.reviewRequest?.requestedStatus;
  const pendingRequestLabel = hasPendingReviewRequest
    ? pendingRequestStatus === "published"
      ? "Publish request pending"
      : "Archive request pending"
    : null;
  const statusOptionsByCurrentStatus = {
    draft: ["preview", "published"],
    preview: ["published"],
    published: ["archived"],
    archived: [],
  };
  const availableStatusOptions = statusOptionsByCurrentStatus[
    bookData.status
  ].map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  }));

  const handlePreviewBook = async (bookId) => {
    const pdf = await sendRequest({
      url: `/books/${bookId}/preview`,
      method: "get",
      responseType: "blob",
    });
    const url = URL.createObjectURL(pdf);
    window.open(url, "_blank");

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleUpdateStatus = async (
    status,
    { skipConfirmation = false } = {},
  ) => {
    if (!status || status === bookData.status) {
      setIsEditing(false);
      return;
    }

    if (status === "archived" && !skipConfirmation) {
      warningModalOpen();
      return;
    }
    try {
      setIsUpdatingStatus(true);
      let request;
      switch (status) {
        case "published":
          request = {
            url: `/books/${bookData._id}/submit-for-review`,
            method: "post",
          };
          break;
        case "archived":
          request = {
            url: `/books/${bookData._id}/request-archive`,
            method: "post",
          };
          break;
        default:
          request = {
            url: `/books/${bookData._id}/status`,
            method: "put",
            body: { status },
          };
      }

      const response = await sendRequest(request);
      if (status === "published" || status === "archived") {
        onBookStatusUpdated({
          ...bookData,
          reviewRequest: {
            requestedStatus: status,
            requestedAt: new Date().toISOString(),
          },
        });
      }

      if (status === "published")
        toast.success("Your publish request has been sent");
      else if (status === "archived")
        toast.success("Your archive request has been sent");
      else {
        const updatedBook = response.book;
        onBookStatusUpdated(updatedBook);
        setPendingStatus(updatedBook.status);
      }
      setIsEditing(false);
      close();
      warningModalClose();
    } catch (error) {
      console.error(error);
      setPendingStatus(bookData.status);
      toast.error("Could not update status, something went wrong");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isBookPublishable = (book) => {
    if (!book.chapters || book.chapters.length < 1) return false;
    if (book.status !== "draft") return false;
    if (hasPendingReviewRequest) return false;
    if (!statusOptionsByCurrentStatus[book.status].includes("published"))
      return false;

    return true;
  };

  const handleOpenModal = () => {
    setPendingStatus(bookData.status);
    setIsEditing(false);
    open();
  };

  const handleCancelEditing = () => {
    setPendingStatus(bookData.status);
    setIsEditing(false);
  };

  const handleSharePreview = async (bookId, email, duration) => {
    try {
      setIsSharing(true);
      const body = duration ? { email, durationMs: duration } : { email };
      await sendRequest({
        url: `/preview-share/${bookId}`,
        method: "post",
        body,
      });

      shareModalClose();
      toast.success(`Preview shared with ${email}`);
    } catch (error) {
      console.error(error);
      toast.error("Couldn't share your preview, something went wrong!");
    } finally {
      setIsSharing(false);
    }
  };
  const handleDeleteConfirmed = async () => {
    try {
      setIsDeleting(true);
      await onDeleteBook(bookData._id);
      closeDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Table.Tr>
        <Table.Td>
          <strong>{bookData.title}</strong>
        </Table.Td>
        <Table.Td>
          {!isEditing ? (
            <Group gap={6} wrap="nowrap">
              <Badge color="copper" variant="light">
                {bookData.status}
              </Badge>
              {pendingRequestLabel && (
                <Badge color="moss" variant="light">
                  {pendingRequestLabel}
                </Badge>
              )}
              {availableStatusOptions.length > 0 && !hasPendingReviewRequest && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => {
                    setPendingStatus(bookData.status);
                    setIsEditing(true);
                  }}
                  disabled={isUpdatingStatus}
                  aria-label="Edit status"
                >
                  <Edit3 size={14} />
                </ActionIcon>
              )}
            </Group>
          ) : (
            <Group gap={6} wrap="nowrap">
              <Select
                size="xs"
                value={pendingStatus}
                data={[
                  {
                    value: bookData.status,
                    label:
                      bookData.status.charAt(0).toUpperCase() +
                      bookData.status.slice(1),
                  },
                  ...availableStatusOptions,
                ]}
                onChange={(value) => value && setPendingStatus(value)}
                disabled={isUpdatingStatus}
                allowDeselect={false}
                flex={1}
              />
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={handleCancelEditing}
                disabled={isUpdatingStatus}
                aria-label="Cancel status edit"
              >
                <X size={14} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="copper"
                size="sm"
                onClick={() => handleUpdateStatus(pendingStatus)}
                loading={isUpdatingStatus}
                disabled={isUpdatingStatus || pendingStatus === bookData.status}
                aria-label="Save status"
              >
                <Check size={14} />
              </ActionIcon>
            </Group>
          )}
        </Table.Td>
        <Table.Td ta="center">{chapterCount}</Table.Td>
        <Table.Td>
          <Text size="sm">
            {new Date(bookData.updatedAt).toLocaleDateString()}
          </Text>
        </Table.Td>
        <Table.Td ta="right">
          <Group gap="xs" justify="flex-end">
            {isBookPublishable(bookData) && (
              <ActionIcon
                variant="subtle"
                color="gray"
                title="Publish Book"
                onClick={handleOpenModal}
              >
                <UploadCloud size={16} strokeWidth={2.5} />
              </ActionIcon>
            )}

            {bookData.status === "preview" && !hasPendingReviewRequest && (
              <ActionIcon
                variant="subtle"
                color="copper"
                title="Share Preview"
                onClick={() => shareModalOpen()}
              >
                <Share2Icon size={16} strokeWidth={2.5} />
              </ActionIcon>
            )}

            <ActionIcon
              variant="subtle"
              color="copper"
              title="View Book"
              onClick={() => handlePreviewBook(bookData._id)}
            >
              <Eye size={16} strokeWidth={2.5} />
            </ActionIcon>

            <ActionIcon
              component={Link}
              to={`/books/${bookData._id}/chapters`}
              variant="subtle"
              color="copper"
              title="Edit Chapters"
            >
              <Edit3 size={16} strokeWidth={2.5} />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              color="red"
              title="Delete Draft"
              onClick={openDeleteModal}
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>

      {/* Action Modals */}
      <SharePreviewConfirmation
        close={shareModalClose}
        opened={shareModalOpened}
        onActionLoading={isSharing}
        onConfirm={handleSharePreview}
        bookId={bookData._id}
      />
      <PublishBookConfirmation
        book={bookData}
        close={close}
        opened={opened}
        onConfirm={() => handleUpdateStatus("published")}
        onActionLoading={isUpdatingStatus}
      />
      <BookActionConfirmation
        book={bookData}
        close={warningModalClose}
        opened={warningModalOpened}
        title="Archive Book"
        description="Are you sure you want to archive this book?"
        confirmLabel="Archive"
        onConfirm={() =>
          handleUpdateStatus("archived", { skipConfirmation: true })
        }
        onActionLoading={isUpdatingStatus}
      />
      <BookActionConfirmation
        book={bookData}
        close={closeDeleteModal}
        opened={deleteModalOpened}
        title="Delete Book"
        description="Are you sure you want to delete this book? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirmed}
        onActionLoading={isDeleting}
      />
    </>
  );
}
