import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="section">
       <h1 className="about-title">About us</h1>
      <div className="container about-page">
        

        <section className="about-founder">
          <div className="about-founder__image">
            <Image
              src="/assets/Ceo.png"
              alt="Sarah Hoskin"
              width={420}
              height={520}
            />
          </div>

          <div className="about-founder__content">
            <h2>Sarah Hoskin</h2>
            <p className="about-role">Founder and Managing Director</p>

            <p>
              Shallion Support was founded with a deep understanding of the
              challenges faced by individuals managing chronic illnesses such as
              M.E., Long Covid, fibromyalgia, and PTSD.
            </p>

            <p>
              Our mission is to provide practical, compassionate support to help
              people who are physically unable to manage their daily tasks.
            </p>

            <p>
              Shallion Support exists to ensure no one has to go through such
              experiences alone. We offer bespoke, non-medical support to help
              individuals manage daily life.
            </p>

            <p>
              Whether it’s assisting with daily tasks, helping families with
              children’s homework, preparing meals, organising a grocery shop,
              or simply being there, we are committed to making a difference
              where it matters most.
            </p>

           
          </div>
        </section>
      </div>
    </div>
  );
}