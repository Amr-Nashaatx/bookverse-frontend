import {
  ActionIcon,
  Burger,
  Button,
  Container,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useBooksStore } from "../../stores/booksStore";
import { sendRequest } from "../../utils/sendRequest";
import "./Navbar.css";
import { NotificationBell } from "../NotificationBell";

const getNavLinkClassName = ({ isActive }) =>
  `app-navbar__link${isActive ? " app-navbar__link--active" : ""}`;

export default function Navbar() {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const { isLoggedIn, logout, currentUser } = useAuthStore();
  const clearStore = useBooksStore((s) => s.clearStore);
  const location = useLocation();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const isDarkMode = computedColorScheme === "dark";

  useEffect(() => {
    setMobileMenuOpened(false);
  }, [location.pathname]);

  const onLogoutClick = async () => {
    await sendRequest({ url: "/auth/logout", method: "post" });
    logout();
    clearStore();
  };

  const onColorSchemeToggle = () => {
    setColorScheme(isDarkMode ? "light" : "dark");
  };

  return (
    <header className="app-navbar">
      <Container size="lg" className="app-navbar__inner">
        <div className="app-navbar__layout">
          <Link to="/books" className="app-navbar__brand-link">
            <Text className="app-navbar__brand">BookVerse</Text>
          </Link>

          <div className="app-navbar__controls">
            <ActionIcon
              variant="subtle"
              color="copper"
              radius="xl"
              size="lg"
              onClick={onColorSchemeToggle}
              style={{ margin: "auto 0" }}
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              className="app-navbar__theme-toggle"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </ActionIcon>

            <Burger
              opened={mobileMenuOpened}
              onClick={() => setMobileMenuOpened((opened) => !opened)}
              style={{ display: "block" }}
              hiddenFrom="md"
              size="md"
              color="var(--mantine-color-ink-8)"
              aria-label={
                mobileMenuOpened
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              className="app-navbar__burger"
            />
          </div>

          <div
            className={`app-navbar__actions${
              mobileMenuOpened ? " app-navbar__actions--open" : ""
            }`}
          >
            <NavLink to="/books" end className={getNavLinkClassName}>
              Books
            </NavLink>

            <div className="app-navbar__primary-actions">
              {isLoggedIn &&
                (!(currentUser.role === "author") ? (
                  <Button
                    component={Link}
                    to="/author/onboarding"
                    color="copper"
                  >
                    Become an Author
                  </Button>
                ) : (
                  <>
                    <NavLink to="/books/new" className={getNavLinkClassName}>
                      Write a Book
                    </NavLink>
                    <NavLink
                      to="/author/my-books"
                      className={getNavLinkClassName}
                    >
                      Manage My Books
                    </NavLink>
                  </>
                ))}
            </div>

            <div className="app-navbar__auth-actions">
              {isLoggedIn ? (
                <>
                  <NotificationBell />
                  <NavLink to="/profile" className={getNavLinkClassName}>
                    Profile
                  </NavLink>
                  <Button
                    component={Link}
                    to="/login"
                    onClick={onLogoutClick}
                    variant="subtle"
                    color="copper"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/signup" end className={getNavLinkClassName}>
                    Signup
                  </NavLink>
                  <Button component={Link} to="/login" color="copper">
                    Login
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
