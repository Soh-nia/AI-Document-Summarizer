
const Header = () => {
  return (
  <nav id="mainNav" className="d-none d-sm-block navbar navbar-expand-lg navbar-sticky navbar-dark">
    <div className="container px-6">
      <a href="index-2.html" className="navbar-brand">
        <span
            className={"font-bold text-white text-3xl"}
            style={{ fontFamily: "'Transforma Mix', 'Playfair Display', Georgia, serif" }}>Doc.AI</span>
        </a>

      <ul className="navbar-nav navbar-nav-secondary order-lg-3">
        <li className="nav-item">
          <a href="#main"
            className="btn btn-outline-white rounded-pill ms-2">
            Get Started
          </a>
        </li>
      </ul>

    </div>
  </nav>
  )
}

export default Header
