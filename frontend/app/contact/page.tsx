export default function ContactPage() {
  return (
    <div className="section contact-page">
      <div className="container contact-panel">
        <h1>Contact Us</h1>

        <p className="lead">
          If you would like to get in touch with Shallion Connections, please
          send us a message using the form below.
        </p>

        <p className="contact-email">
          hello@shallion.co.uk
        </p>

        <form className="contact-form">
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" className="input" type="text" />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" />
          </div>

          <div>
            <label htmlFor="message">Message</label>
            <textarea id="message" className="textarea" rows={6} />
          </div>

          <button className="btn btn-primary" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}