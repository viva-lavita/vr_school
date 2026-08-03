import { Montserrat } from 'next/font/google'
import { Inter  } from 'next/font/google'
import { Exo_2 } from 'next/font/google'

export const montserrat = Montserrat({
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500', '600'],
    style: ['normal'],
    variable: '--font-montserrat',
    display: 'swap',
})

export const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500', '600'],
    style: ['normal'],
    variable: '--font-inter',
    display: 'swap',

})

export const exo2 = Exo_2({
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500', '600', '700', '800'],
    style: ['normal'],
    variable: '--font-exo2',
    display: 'swap',
})
