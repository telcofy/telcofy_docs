import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const contacts = [
  {
    name: "Tormod",
    email: "tormod@telcofy.ai",
    phone: "+47 901 15 059", 
    role: "Chief Executive Officer",
    image: "img/tormod_profile.jpeg", 
    expertise: "Strategic Vision & Leadership"
  },
  {
    name: "Tom",
    email: "tom@telcofy.ai", 
    phone: "+47 918 90 064", 
    role: "Chief Commercial Officer",
    image: "img/tom_profile.png", 
    expertise: "Business Development & Partnerships"
  }
];

function ContactCard({ contact }) {
  return (
    <div className="card margin-bottom--lg">
      <div className="card__header">
        <div className="avatar">
          <div
            className={`avatar__photo avatar__photo--lg ${styles.profileImage}`}
            style={{
              backgroundImage: `url(${useBaseUrl(contact.image)})`,
            }}
            aria-label={`${contact.name} profile`}
          />
          <div className="avatar__intro">
            <div className="avatar__name">{contact.name}</div>
            <small className="avatar__subtitle">{contact.role}</small>
          </div>
        </div>
      </div>
      <div className="card__body">
        <p><strong>Expertise:</strong> {contact.expertise}</p>
        <p>
          <strong>Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </p>
        <p>
          <strong>Phone:</strong> <a href={`tel:${contact.phone}`}>{contact.phone}</a>
        </p>
      </div>
    </div>
  );
}

export default function ContactSection() {
  return (
    <section className={styles.contactSection}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <h2 className="text--center margin-bottom--lg">Get in Touch</h2>
            <p className="text--center margin-bottom--xl">
              Ready to transform your telecommunications data? Our team is here to help you get started with Telcofy.
            </p>
          </div>
        </div>
        <div className="row">
          {contacts.map((contact, idx) => (
            <div key={idx} className="col col--6">
              <ContactCard contact={contact} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}