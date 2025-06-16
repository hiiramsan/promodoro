import Silk from '../components/Silk';
import Timer from '../components/Timer';
import Navbar from '../components/Navbar';
import Tasks from '../components/Tasks';

const Home = () => {
    return (
        <div className="min-h-screen text-white relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <Silk
                    speed={5}
                    scale={1}
                    color="#293132"
                    noiseIntensity={1.5}
                    rotation={0}
                />
            </div>

            <div className="relative z-10">
                <Navbar />
                <div className="container mx-auto px-6 lg:px-12 py-4">
                    <div className="flex justify-between items-start gap-8">
                        <div className="flex flex-col w-full space-y-8">
                            <Tasks />
                            {/* here its gonna be projects */}
                        </div>
                        <Timer />
                    </div>
                </div>
                <div className="h-20"></div>
            </div>
        </div>
    )
}

export default Home;