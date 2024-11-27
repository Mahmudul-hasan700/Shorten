import UrlShortenerForm from '@/components/UrlShortenerForm'

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto p-5">
      <h1 className="text-4xl font-bold text-center mb-8">Shorten Your URL</h1>
      <UrlShortenerForm />
    </div>
  )
}

