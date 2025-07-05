import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Silk from "../components/Silk";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import ProjectsSlider from "../components/Projects/ProjectsSlider";

const ProjectsPage = () => {

    const { user } = useAuth();
    const [isLoading, setIsLoading ] = useState(true);

    // Set document title
    useEffect(()=> {
        document.title = `My projects`
    }, []);

    // fetch user's projects
    useEffect(()=> {
        fetchUserProjects()
    }, [user])

    const fetchUserProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            if(!token) {
                setIsLoading(false);
                return;
            }

            const response = await axios.get("http://localhost:3000/api/projects", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log(response.data);

        } catch (error) {
            console.log('Error fetching projects!', error)   
        }
    }

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
                    <div className="flex justify-between items-start flex-col gap-10">
                        <ProjectsSlider />
                    </div>
                </div>
                <div className="h-20"></div>
            </div>
        </div>
    )
}

export default ProjectsPage;