export const metadata = {
  title: "About",
  description: "Learn about our AI and Machine Learning course platform.",
};

export default function AboutPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h1 className="text-h1">About This Platform</h1>

        <div className="mt-8 prose-article">
          <p>
            Welcome to our AI and Machine Learning course platform. We&apos;re
            dedicated to providing high-quality, accessible education in
            artificial intelligence and machine learning.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is to make AI and ML education accessible to everyone.
            We believe that understanding these technologies is crucial for the
            future, and we&apos;re committed to creating comprehensive, well-structured
            courses that take you from fundamentals to advanced concepts.
          </p>

          <h2>Course Structure</h2>
          <p>
            Each course is organized into chapters, and each chapter contains
            multiple articles. This structure allows you to progress through the
            material at your own pace, building a solid foundation before moving
            on to more advanced topics.
          </p>

          <h2>Get Started</h2>
          <p>
            Ready to begin your learning journey? Head over to our{" "}
            <a href="/courses">courses page</a> to explore what we offer and find
            the right course for you.
          </p>
        </div>
      </div>
    </div>
  );
}
