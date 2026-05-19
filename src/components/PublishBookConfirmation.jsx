import {
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";

export default function PublishBookConfirmation({
  book,
  close,
  opened,
  onConfirm,
  onActionLoading,
}) {
  const description = book.description ?? "No description provided.";
  const chapterCount = book.chapters?.length ?? 0;
  const truncatedDescription =
    description.length > 180
      ? `${description.substring(0, 180)}...`
      : description;

  return (
    <Modal
      onClose={close}
      opened={opened}
      centered
      title="Publish Book"
      size="lg"
    >
      <Stack gap="lg">
        <Text c="dimmed">
          Review the book details before submitting a publish request for
          admins.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Paper withBorder radius="md" p="md">
            <Text size="xs" tt="uppercase" fw={700} c="copper.5">
              Book title
            </Text>
            <Text mt={6} fw={600}>
              {book.title}
            </Text>
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Text size="xs" tt="uppercase" fw={700} c="copper.5">
              Chapters
            </Text>
            <Text mt={6} fw={600}>
              {chapterCount}
            </Text>
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Text size="xs" tt="uppercase" fw={700} c="copper.5">
              Status
            </Text>
            <Badge mt={8} color="copper" variant="light">
              {book.status}
            </Badge>
          </Paper>

          <Paper withBorder radius="md" p="md">
            {" "}
            <Text size="xs" tt="uppercase" fw={700} c="copper.5">
              Last updated
            </Text>
            <Text mt={6} fw={600}>
              {new Date(book.updatedAt).toLocaleDateString()}
            </Text>
          </Paper>
        </SimpleGrid>

        <Paper withBorder radius="md" p="md">
          <Text size="xs" tt="uppercase" fw={700} c="copper.5">
            Description
          </Text>
          <Text mt={8} c="dimmed" lh={1.6}>
            {truncatedDescription}
          </Text>
        </Paper>

        <Group>
          <Button onClick={onConfirm} loading={onActionLoading}>
            Publish Now
          </Button>
          <Button variant="outline" onClick={close} disabled={onActionLoading}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
