// client/components/NotificationBell.jsx
import { useState } from "react";
import {
  Indicator,
  ActionIcon,
  Popover,
  Stack,
  Text,
  ScrollArea,
  Group,
  Badge,
  Divider,
  Box,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { Bell } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { API_BASE_URL } from "../constants";
import "./NotificationBell.css";
import { useNavigate } from "react-router-dom";

function NotificationItem({ notification, onOpen }) {
  const isUnread = !notification.readAt;

  return (
    <UnstyledButton onClick={() => onOpen(notification)} w="100%">
      <Box
        className={`notification-item${
          isUnread ? " notification-item--unread" : ""
        }`}
        px="md"
        py="sm"
      >
        <Group justify="space-between" wrap="nowrap" mb={2}>
          <Text
            className="notification-item__title"
            size="sm"
            fw={isUnread ? 700 : 500}
            lineClamp={1}
          >
            {notification.title}
          </Text>
          <Text
            className="notification-item__time"
            size="xs"
            style={{ whiteSpace: "nowrap" }}
          >
            {new Date(notification.createdAt).toLocaleTimeString(["en"], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </Group>
        {notification.message && (
          <Text className="notification-item__message" size="xs" lineClamp={2}>
            {notification.message}
          </Text>
        )}
      </Box>
    </UnstyledButton>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, connected, markRead } =
    useNotifications();
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const handleOpenNotification = async (notification) => {
    if (!notification.readAt) {
      await markRead(notification._id);
    }

    if (notification.actionUrl) {
      navigate(`${notification.actionUrl}`);
    }
  };

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      offset={8}
      shadow="md"
      width={360}
      radius="md"
    >
      <Popover.Target>
        <Tooltip
          label={connected ? "Notifications (live)" : "Reconnecting..."}
          position="bottom"
        >
          <Indicator
            color="brick"
            size={16}
            label={unreadCount > 99 ? "99+" : unreadCount}
            disabled={unreadCount === 0}
            processing={!connected}
            classNames={{ indicator: "notification-bell__indicator" }}
          >
            <ActionIcon
              className="notification-bell__button"
              variant="subtle"
              color="copper"
              size="lg"
              radius="md"
              onClick={() => setOpened((o) => !o)}
              aria-label="Open notifications"
            >
              <Bell size={20} />
            </ActionIcon>
          </Indicator>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown className="notification-popover" p={0}>
        <Group
          className="notification-popover__header"
          px="md"
          py="sm"
          justify="space-between"
        >
          <Group gap="xs">
            <Text className="notification-popover__title" fw={700} size="sm">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Badge size="sm" variant="light" color="copper" radius="md">
                {unreadCount} new
              </Badge>
            )}
          </Group>
          <Group gap={6}>
            <Tooltip label={connected ? "Live" : "Reconnecting..."}>
              <Box
                className={`notification-popover__status-dot${
                  connected ? " notification-popover__status-dot--live" : ""
                }`}
              />
            </Tooltip>
            <Text className="notification-popover__status-text" size="xs">
              {connected ? "Live" : "Reconnecting..."}
            </Text>
          </Group>
        </Group>

        <Divider className="notification-popover__divider" />

        {notifications.length === 0 ? (
          <Stack className="notification-empty" align="center" py="xl" gap="xs">
            <Bell size={32} />
            <Text size="sm">You're all caught up!</Text>
          </Stack>
        ) : (
          <ScrollArea.Autosize mah={420} scrollbarSize={6}>
            <Stack gap={0}>
              {notifications.map((n, i) => (
                <Box key={n._id}>
                  <NotificationItem
                    notification={n}
                    onOpen={handleOpenNotification}
                  />
                  {i < notifications.length - 1 && (
                    <Divider className="notification-popover__divider" />
                  )}
                </Box>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
