import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ isAdmin }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/">
        🎓 NFT Identity DApp
      </Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">
              Dashboard
            </Link>
          </li>

          {isAdmin && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/identity">
                  Mint Identity
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/add-course">
                  Add Course
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/certificates-form">
                  Mint Certificates
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/fee-control">
                  Fee Control
                </Link>
              </li>
            </>
          )}

          <li className="nav-item">
            <Link className="nav-link" to="/course-registration">
              Course Registration
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/pay-fee">
              Fee Payment
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/certificates">
              My Certificates
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/amenities">
              Amenities
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;