import {TachiyomiSource, TachiyomiExtension, Manga, Chapter, parseChapterList, parseMangaDetails, parseChapterDetails, search} from 'tachiyomi-extensions'

class MangaRabicSource extends TachiyomiSource {

  constructor() {
    super('MangaRabic', 'https://mangarabic.com', ['ar'], false)
  }

  async fetchChapterList(manga: Manga): Promise<Chapter[]> {
    const response = await fetch(`https://mangarabic.com/manga/${manga.url.split('/')[2]}/`)
    const html = await response.text()
    const chapterList = parseChapterList(html, /<div class="chapter-list">(.+?)<\/div>/s, /<a href="(.+?)".*?>(.+?)<\/a>/s)
    return chapterList.map(chapter => ({
      ...chapter,
      url: `https://mangarabic.com${chapter.url}`,
      date: new Date(chapter.date)
    }))
  }

  async fetchMangaDetails(manga: Manga): Promise<Manga> {
    const response = await fetch(`https://mangarabic.com/manga/${manga.url.split('/')[2]}/`)
    const html = await response.text()
    const mangaDetails = parseMangaDetails(html, /<div class="manga-info">(.+?)<\/div>/s, /<h1>(.+?)<\/h1>/s, /<div class="manga-info-genres">(.+?)<\/div>/s, /<div class="manga-info-author">(.+?)<\/div>/s, /<div class="manga-info-status">(.+?)<\/div>/s)
    return mangaDetails
  }

  async fetchChapterDetails(chapter: Chapter): Promise<Chapter> {
    const response = await fetch(`${chapter.url}`)
    const html = await response.text()
    const chapterDetails = parseChapterDetails(html, /<div class="chapter-content">(.+?)<\/div>/s)
    return chapterDetails
  }

  async search(query: string, page: number): Promise<Manga[]> {
    const response = await fetch(`https://mangarabic.com/?s=${query}&post_type=manga&paged=${page}`)
    const html = await response.text()
    const mangaList = parseChapterList(html, /<article class="post-item">(.+?)<\/article>/s, /<a href="(.+?)".*?>(.+?)<\/a>/s)
    return mangaList.map(manga => ({
      ...manga,
      url: `https://mangarabic.com${manga.url}`,
      thumbnail_url: `https://mangarabic.com${manga.thumbnail_url}`
    }))
  }
}

const MangaRabicExtension = new TachiyomiExtension('MangaRabic', 'com.github.yourusername.mangarabic', MangaRabicSource)

export default MangaRabicExtension
