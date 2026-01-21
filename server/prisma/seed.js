import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        email: "harvey.specter@gmail.com",
        name: "Harvey Specter",
        profilePicture: "/avatars/1.png",
        about: "I live life like this",
      },
      {
        email: "mike.ross@gmail.com",
        name: "Mike Ross",
        profilePicture: "/avatars/2.png",
        about: "Photographic memory",
      },
      {
        email: "rachel.zane@gmail.com",
        name: "Rachel Zane",
        profilePicture: "/avatars/3.png",
        about: "Lawyer",
      },
      {
        email: "louis.litt@gmail.com",
        name: "Louis Litt",
        profilePicture: "/avatars/4.png",
        about: "You just got Litt up",
      },
      {
        email: "donna.paulsen@gmail.com",
        name: "Donna Paulsen",
        profilePicture: "/avatars/5.png",
        about: "Donna knows everything",
      },
      {
        email: "jessica.pearson@gmail.com",
        name: "Jessica Pearson",
        profilePicture: "/avatars/6.png",
        about: "Managing Partner",
      },
      {
        email: "alex.williams@gmail.com",
        name: "Alex Williams",
        profilePicture: "/avatars/7.png",
        about: "Senior Partner",
      },
      {
        email: "katrina.bennett@gmail.com",
        name: "Katrina Bennett",
        profilePicture: "/avatars/8.png",
        about: "Focused & fierce",
      },
      {
        email: "oliver.grady@gmail.com",
        name: "Oliver Grady",
        profilePicture: "/avatars/9.png",
        about: "Good guy",
      },
      {
        email: "steve.rogers@gmail.com",
        name: "Steve Rogers",
        profilePicture: "/avatars/10.png",
        about: "Captain",
      },
      {
        email: "tony.stark@gmail.com",
        name: "Tony Stark",
        profilePicture: "/avatars/11.png",
        about: "Genius billionaire",
      },
      {
        email: "bruce.banner@gmail.com",
        name: "Bruce Banner",
        profilePicture: "/avatars/12.png",
        about: "Don’t make me angry",
      },
      {
        email: "natasha.romanoff@gmail.com",
        name: "Natasha Romanoff",
        profilePicture: "/avatars/13.png",
        about: "Black Widow",
      },
      {
        email: "clint.barton@gmail.com",
        name: "Clint Barton",
        profilePicture: "/avatars/14.png",
        about: "Hawkeye",
      },
      {
        email: "haley.stanford@gmail.com",
        name: "Haley Stanford",
        profilePicture: "/avatars/15.png",
        about: "Music",
      },
    ],
    skipDuplicates: true,
  });

}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
