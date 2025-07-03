import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Link } from "react-router";

const Projects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [numProjects, setNumProjects] = useState(0);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                
                const token = localStorage.getItem('token');
                if(!token || !user) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:3000/api/projects', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const transformedProjects = response.data.map(project => ({
                    id: project._id,
                    name: project.name,
                    color: project.color
                }));

                setProjects(transformedProjects);
                console.log(transformedProjects);

            } catch (error) {   
                console.log('Error fetching projects', error)
            } finally {
                setLoading(false);
            }
        }
    }, [user]); 

    useEffect(() => {
        const fetchNumProjects = async () => {
            try {
                
                const token = localStorage.getItem('token');
                if(token && !user) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:3000/api/projects/num', {
                    headers: {Authorization: `Bearer ${token}`}
                });

                setNumProjects(response.data.count);
                console.log(numProjects);


            } catch (error) {
                
            }
        }
        fetchNumProjects();
    }, [user]);

    return (
        <Link to={'/projects'} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 w-1/2 max-w-2xl min-w-[350px] w-full flex flex-row content-between justify-between items-center">
            <h2 className="text-xl font-inter-bold">My projects</h2>
            <span className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center">
                <p className="text-lg font-inter-bold">{numProjects}</p>
            </span>
        </Link>
    )
}

export default Projects;