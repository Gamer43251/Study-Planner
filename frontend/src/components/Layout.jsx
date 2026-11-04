import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <Navbar expand="lg" className="planner-navbar" variant="dark">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Study Planner
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="planner-nav" />
          <Navbar.Collapse id="planner-nav">
            <Nav>
              <Nav.Link as={NavLink} to="/" end>
                Modules
              </Nav.Link>
              <Nav.Link as={NavLink} to="/dashboard">
                Dashboard
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="pb-5">
        <Outlet />
      </Container>
    </>
  );
}
