import Image from "next/image";
import "./style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const NewsLetter = () => {
  return (
    <div id="newsletter">
      <div className="image-container">
        <Image src="/images/newsletter.jpg" fill alt="newsletter background" />
      </div>

      <div className="content">
        <h4>
          Inscrivez-vous à notre newsletter <br /> et recevez des offres
          exclusives
        </h4>
        <form className="newsletter-form">
          <Input type="email" placeholder="Email" />
          <Button type="submit">S'inscrire maintenant</Button>
        </form>
      </div>
    </div>
  );
};
