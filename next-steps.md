## Loading Obsidian Data
1. How does decap store new moves/concepts?
  - Slugs - Sanitize filenames (slugs) according to RFC3987 and the WHATWG URL spec. This spec allows non-ASCII (or non-Latin) characters to exist in URLs.
  - Relations - slug is saved in the frontmatter

2. Choose some finalized obsidian moves/concepts
  - Vuleta, Enchufla, Dile que no, Cuba, Dile que no position
  - They should be related to each other
  - data in `obsidian-data` folder

3. Build import script
  - slug (filename) should follow the decap cms slug format
  - Convert obsidian links in the text (e.g.`[[move]]`) to normal markdown links
    - Links inside text can be to other moves or concepts
    - Titles of moves and concepts are unique 
  - Convert relation links in the frontmatter to decap relations format
    - For efficiency first save title and convert filenames to slug, then use set to do fast lookups
  - Moves/concepts referenced in the text should be added to the relations frontmatter (if not already present)
  - Convert tab indents to spaces
  - File name should be title, new files should be saved with the slug
  - Arguments for concepts and moves folder, and out moves and out concepts folders
  - date format is "YYYY-MM-DD, H:mm" convert to ISO