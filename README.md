# Geode

Geode is a Discord bot I've been building with Node.js and Discord.js. It started as a way to learn more about bot development, databases, and working with APIs, and has gradually grown into a collection of useful server utilities.

The main focus so far has been reminders, with support for recurring reminders and the ability to manage them directly through Discord.

## What can it do?

- **Set reminders:** Create reminders with custom time intervals, from seconds to days.
- **Recurring reminders:** Set reminders to repeat automatically at a chosen interval.
- **View reminders:** See all your currently active reminders.
- **Remove reminders:** Select and remove reminders you no longer need.
- **Help command:** Get a list of all available commands directly in Discord.

Reminders are stored in a PostgreSQL database, so they don't disappear when the bot restarts.

## Built with

- Node.js
- Discord.js
- PostgreSQL
- Prisma ORM
- Neon (database hosting)

## Getting started

If you want to run Geode locally, you'll need Node.js, a Discord bot application, and a PostgreSQL database.

### Installation

Clone the repository:

```bash
git clone https://github.com/AshenFermion/geode-bot
cd Geode
```

Install the dependencies:

```bash
npm install
```

### Environment variables

Create a `.env` file in the root directory and add the following:

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
DATABASE_URL=your_database_url
```

Replace the example values with your own credentials. Keep this file private and never upload it to GitHub.

### Running the bot

Register the slash commands:

```bash
node src/registerCommands.js
```

Start the bot:

```bash
node index.js
```

## Commands

| Command | What it does |
|---|---|
| `/help` | Shows all available commands. |
| `/reminder` | Sets a new reminder. |
| `/reminderlist` | Shows your active reminders. |
| `/reminderremove` | Lets you select and remove reminders. |

## A little more about the project

Geode is an ongoing project, and I'm using it to get more comfortable with JavaScript, working with databases, and building applications that interact with external services.

There are still things I'd like to add and improve, but this is where the project currently stands.

## License

No license has been added yet.
