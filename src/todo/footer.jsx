import '../assets/styles/footer.styl'

export default {
    data () {
        return {
            author: 'Jiaen'
        }
    },
    render () {
        return (
            <div id="footer">
                <span>Writen by {this.author}</span>
            </div>
        )
    }
}