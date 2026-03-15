# TG-City

A 3D data visualization of the Ethiopian Telegram ecosystem. This project transforms raw Telegram channel data into a living, breathing metropolis where the city's architecture is shaped by community engagement.

##  How the City Works
The skyline of **TG-City** is driven by real-time data:
- **Height (Y-Axis):** Determined by the channel's **Subscriber Count** (using logarithmic scaling).
- **Width (Girth):** Determined by the **Average Views per Post**, representing engagement density.
- **Districts:** Channels are organized into 10 specialized neighborhoods (News, Tech, Entertainment, etc.) based on their category.
- **Downtown:** The top-tier channels form a dense skyscraper core at the center of the map.


##  Respect & Credits
This project is a **fork of [Git City](https://github.com/srizzon/git-city)** by Rizqi. 

While the original project focused on GitHub contributions, **TG-City** has been heavily modified to:
- Visualize Telegram API data instead of GitHub events.
- Implement a localized "Addis Ababa" district and category system.
- Feature a custom 3D layout engine optimized for community growth.

## 🚀 Getting Started
1. Clone the repository.
2. Install dependencies: `bun install`
3. Run the development server: `bun dev`
4. Open [http://localhost:3000](http://localhost:3000) to explore the city.
