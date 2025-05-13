import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const PageTransition = ({ children }) => {
    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20
        },
        in: {
            opacity: 1,
            y: 0
        },
        exit: {
            opacity: 0,
            y: -20
        }
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.5
    };

    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
        >
            {children}
        </motion.div>
    );
};

PageTransition.propTypes = {
    children: PropTypes.node.isRequired
};

export default PageTransition; 