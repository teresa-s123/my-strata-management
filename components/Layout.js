import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, title = 'Oceanview Apartments' }) {
  return (
    <>
      <Head>
        <title>{title} - Strata Management</title>
        <meta name="description" content="Strata management portal for Oceanview Apartments" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Navbar />
      
      <main>{children}</main>
      
      <Footer />
    </>
  );
}