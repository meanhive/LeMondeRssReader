import React, { useEffect, useState } from 'react'
import { useWindowDimensions, ScrollView, StatusBar, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Headline, Paragraph, Subheading, Surface } from 'react-native-paper'
import WebView from 'react-native-webview'

import Header from '../components/Header'

/**
 * @author Matthieu BACHELIER
 * @since 2020-04
 * @version 1.0
 */
export default function VideoScreen({ route, doc, url }) {
  const [data, setData] = useState({ title: route.params?.item?.title, description: route.params?.item?.description })
  const [videoData, setVideoData] = useState({})
  const [item, setItem] = useState({ id: route.params?.item?.id, uri: route.params?.item?.uri })
  const [loading, setLoading] = useState(true)
  const window = useWindowDimensions()

  const styles = StyleSheet.create({
    paddingH: {
      paddingHorizontal: 8,
    },
    videoContainer: {
      marginTop: 20,
      width: window.width,
      height: (window.width * 9) / 16,
    },
  })

  useEffect(() => {
    init()
  }, [doc])

  const init = async () => {
    setLoading(true)
    if (!doc) {
      return
    }

    let d = { ...data }
    const main = doc.querySelector('main')

    // Header
    // Check if user has open this Article from the Home or from an external App like Firefox
    if (route.params?.item) {
      d.link = route.params.item.link
      d.title = route.params.item.title
      d.description = route.params.item.description
    } else {
      d.link = url
      d.title = main.querySelector('h1')?.rawText
      d.description = main.querySelector('p.article__desc')?.text.trim()
    }

    // Category
    const metas = doc.querySelectorAll('meta')
    for (const meta of metas) {
      const property = meta.getAttribute('property')
      if ('og:article:section' === property) {
        d.category = meta.getAttribute('content')
      } else if ('og:article:author' === property) {
        d.authors = meta.getAttribute('content')
      }
      if (!route.params?.item?.uri && 'og:image' === property) {
        d.imgUri = meta.getAttribute('content')
      }
    }

    setItem({ ...item, imgUri: d.imgUri, title: d.title, description: d.description, category: d.category, link: d.link })

    let date = main.querySelector('span.meta__date')
    if (date) {
      d.date = date.rawText
    } else {
      d.date = main.querySelector('p.meta__publisher')?.text
    }

    const videoContainer = main.querySelector('.article__special-container--video div')
    if (videoContainer) {
      const provider = videoContainer.getAttribute('data-provider')
      const id = videoContainer.getAttribute('data-id')
      if (id && provider) {
        setVideoData({ id, provider })
      }
    }

    setData(d)
    setLoading(false)
  }

  const renderVideoContainer = () => {
    if (videoData.provider) {
      switch (videoData.provider) {
        case 'dailymotion':
          return <WebView source={{ uri: `https://www.dailymotion.com/embed/video/${videoData.id}` }} style={styles.videoContainer} />
        case 'youtube':
          return <WebView source={{ uri: `https://www.youtube.com/embed/${videoData.id}` }} style={styles.videoContainer} />
      }
    }
    return false
  }

  return (
    <Surface style={{ flex: 1 }}>
      {data.isRestricted && <StatusBar backgroundColor={'rgba(255,196,0,1.0)'} barStyle="dark-content" animated />}
      <ScrollView style={{ paddingTop: StatusBar.currentHeight }}>
        <Header data={data} item={item} loading={loading} />
        <Headline style={styles.paddingH}>{data.title}</Headline>
        <Subheading style={styles.paddingH}>{data.description}</Subheading>
        {loading ? (
          <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignContent: 'center', height: '100%' }} />
        ) : (
          <>
            <Paragraph style={styles.paddingH}>{data.authors}</Paragraph>
            <Paragraph style={styles.paddingH}>{data.date}</Paragraph>
          </>
        )}
        {renderVideoContainer()}
        <View style={{ paddingBottom: 40 }} />
      </ScrollView>
    </Surface>
  )
}
