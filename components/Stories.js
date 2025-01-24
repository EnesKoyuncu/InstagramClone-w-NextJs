// import { faker } from '@faker-js/faker';
import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";
import Story from "./Story";
import { useSession } from "next-auth/react";

function Stories() {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const suggestions = [...Array(20)].map((_, i) => ({
      userId: faker.string.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      avatar: `https://i.pravatar.cc/${i * 13}`,
      password: faker.internet.password(),
      birthdate: faker.date.birthdate(),
      registeredAt: faker.date.past(),
      id: i,
    }));
    setSuggestions(suggestions);
  }, []);

  return (
    <div
      className="flex space-x-2 p-6 bg-white mt-8 border-gray-200
     border rounded-sm overflow-x-scroll scrollbar-thin 
     scrollbar-thumb-black"
    >
      {session && (
        <Story img={session.user.image} username={session.user.username} />
      )}

      {suggestions.map((profile) => (
        <Story
          key={profile.id}
          img={profile.avatar}
          username={profile.username}
        />
      ))}
    </div>
  );
}

export default Stories;
